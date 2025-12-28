"""
Shared Skill Manager for Multi-Bot Collaboration

This module provides a centralized skill repository that multiple Voyager
instances can contribute to and retrieve from. Skills are attributed to
the bot that created them.
"""

import os
from datetime import datetime

import voyager.utils as U
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_chroma import Chroma

from voyager.prompts import load_prompt
from voyager.control_primitives import load_control_primitives


class SharedSkillManager:
    """
    Manages a shared skill library that multiple bots can contribute to.

    Each skill is attributed to the bot that created it, with metadata
    including creation time, version, and success/failure counts.
    """

    def __init__(
        self,
        model_name="gpt-3.5-turbo",
        temperature=0,
        retrieval_top_k=5,
        request_timeout=120,
        shared_dir="shared_skills",
        bot_id="bot",
        bot_name="Bot",
        resume=True,
        openai_api_base=None,
    ):
        self.bot_id = bot_id
        self.bot_name = bot_name
        self.shared_dir = shared_dir
        self.retrieval_top_k = retrieval_top_k

        # Set up LLM for skill description generation
        llm_kwargs = dict(
            model_name=model_name,
            temperature=temperature,
            request_timeout=request_timeout,
        )
        if openai_api_base:
            llm_kwargs["openai_api_base"] = openai_api_base
        self.llm = ChatOpenAI(**llm_kwargs)

        # Create shared directories
        U.f_mkdir(f"{shared_dir}/code")
        U.f_mkdir(f"{shared_dir}/description")
        U.f_mkdir(f"{shared_dir}/vectordb")

        # Load control primitives (base skills available to all bots)
        self.control_primitives = load_control_primitives()

        # Load existing skills
        skills_path = f"{shared_dir}/skills.json"
        if resume and os.path.exists(skills_path):
            print(f"\033[33m[{bot_name}] Loading shared skills from {shared_dir}\033[0m")
            self.skills = U.load_json(skills_path)
        else:
            self.skills = {}

        # Initialize vector database for semantic search
        self.vectordb = Chroma(
            collection_name="shared_skill_vectordb",
            embedding_function=OpenAIEmbeddings(),
            persist_directory=f"{shared_dir}/vectordb",
        )

        # Sync vectordb with skills JSON
        self._sync_vectordb()

    def _sync_vectordb(self):
        """Ensure vectordb is in sync with skills.json"""
        vectordb_count = self.vectordb._collection.count()
        json_count = len(self.skills)

        if vectordb_count != json_count:
            print(f"\033[33m[{self.bot_name}] Syncing vectordb: {vectordb_count} -> {json_count} skills\033[0m")

            # Clear existing vectordb
            if vectordb_count > 0:
                all_ids = self.vectordb._collection.get()["ids"]
                if all_ids:
                    self.vectordb._collection.delete(ids=all_ids)

            # Rebuild from JSON
            for skill_name, entry in self.skills.items():
                self.vectordb.add_texts(
                    texts=[entry.get('description', skill_name)],
                    ids=[skill_name],
                    metadatas=[{
                        "name": skill_name,
                        "created_by": entry.get("created_by", "legacy"),
                    }],
                )
            print(f"\033[33m[{self.bot_name}] Vectordb synced with {json_count} skills\033[0m")

    @property
    def programs(self):
        """Return all skill code as a single string for use in prompts"""
        programs = ""
        for skill_name, entry in self.skills.items():
            programs += f"{entry['code']}\n\n"
        for primitives in self.control_primitives:
            programs += f"{primitives}\n\n"
        return programs

    def add_new_skill(self, info):
        """
        Add a new skill to the shared library.

        Args:
            info: Dict with 'task', 'program_name', 'program_code'
        """
        if info["task"].startswith("Deposit useless items into the chest at"):
            return

        program_name = info["program_name"]
        program_code = info["program_code"]

        # Generate description using LLM
        skill_description = self.generate_skill_description(program_name, program_code)
        print(f"\033[33m[{self.bot_name}] Generated skill: {program_name}\033[0m")

        # Handle existing skill (versioning)
        if program_name in self.skills:
            print(f"\033[33m[{self.bot_name}] Skill {program_name} exists, creating new version\033[0m")
            self.vectordb._collection.delete(ids=[program_name])

            # Find next version number
            i = 2
            while f"{program_name}V{i}.js" in os.listdir(f"{self.shared_dir}/code"):
                i += 1
            dumped_program_name = f"{program_name}V{i}"
            version = i
        else:
            dumped_program_name = program_name
            version = 1

        # Add to vectordb with metadata
        self.vectordb.add_texts(
            texts=[skill_description],
            ids=[program_name],
            metadatas=[{
                "name": program_name,
                "created_by": self.bot_id,
            }],
        )

        # Store skill with attribution
        self.skills[program_name] = {
            "code": program_code,
            "description": skill_description,
            "created_by": self.bot_id,
            "created_by_name": self.bot_name,
            "created_at": datetime.now().isoformat(),
            "version": version,
            "success_count": 0,
            "fail_count": 0,
        }

        # Save to files
        U.dump_text(program_code, f"{self.shared_dir}/code/{dumped_program_name}.js")
        U.dump_text(skill_description, f"{self.shared_dir}/description/{dumped_program_name}.txt")
        U.dump_json(self.skills, f"{self.shared_dir}/skills.json")

        print(f"\033[33m[{self.bot_name}] Saved skill {program_name} (v{version})\033[0m")

    def generate_skill_description(self, program_name, program_code):
        """Generate a description for a skill using LLM"""
        messages = [
            SystemMessage(content=load_prompt("skill")),
            HumanMessage(
                content=program_code + "\n\n" + f"The main function is `{program_name}`."
            ),
        ]
        skill_description = f"    // {self.llm.invoke(messages).content}"
        return f"async function {program_name}(bot) {{\n{skill_description}\n}}"

    def retrieve_skills(self, query):
        """
        Retrieve relevant skills based on a query.

        Args:
            query: Description of what skills are needed

        Returns:
            List of skill code strings
        """
        k = min(self.vectordb._collection.count(), self.retrieval_top_k)
        if k == 0:
            return []

        print(f"\033[33m[{self.bot_name}] Retrieving {k} skills for: {query[:50]}...\033[0m")
        docs_and_scores = self.vectordb.similarity_search_with_score(query, k=k)

        skill_names = [doc.metadata['name'] for doc, _ in docs_and_scores]
        print(f"\033[33m[{self.bot_name}] Found: {', '.join(skill_names)}\033[0m")

        skills = []
        for doc, _ in docs_and_scores:
            skill_name = doc.metadata["name"]
            if skill_name in self.skills:
                skills.append(self.skills[skill_name]["code"])

        return skills

    def record_skill_result(self, skill_name, success):
        """
        Record whether a skill execution succeeded or failed.

        Args:
            skill_name: Name of the skill
            success: True if succeeded, False if failed
        """
        if skill_name in self.skills:
            if success:
                self.skills[skill_name]["success_count"] = \
                    self.skills[skill_name].get("success_count", 0) + 1
            else:
                self.skills[skill_name]["fail_count"] = \
                    self.skills[skill_name].get("fail_count", 0) + 1
            U.dump_json(self.skills, f"{self.shared_dir}/skills.json")

    def get_skills_by_bot(self, bot_id=None):
        """
        Get skills created by a specific bot.

        Args:
            bot_id: Bot ID to filter by, or None for all skills

        Returns:
            Dict of skills
        """
        if bot_id is None:
            return self.skills

        return {
            name: skill for name, skill in self.skills.items()
            if skill.get("created_by") == bot_id
        }

    def get_skill_stats(self):
        """
        Get statistics about the shared skill library.

        Returns:
            Dict with stats
        """
        stats = {
            "total_skills": len(self.skills),
            "by_bot": {},
            "total_successes": 0,
            "total_failures": 0,
        }

        for skill in self.skills.values():
            bot = skill.get("created_by", "legacy")
            stats["by_bot"][bot] = stats["by_bot"].get(bot, 0) + 1
            stats["total_successes"] += skill.get("success_count", 0)
            stats["total_failures"] += skill.get("fail_count", 0)

        return stats
