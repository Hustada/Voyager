"""
Run Voyager with OpenAI GPT-5.x models.

Before running:
1. Set your OPENAI_API_KEY environment variable
2. Have Minecraft 1.19 running with Fabric mods installed
3. Open your world to LAN and note the port number

Usage:
    export OPENAI_API_KEY="your-key"
    python run_voyager.py
"""

import os
from voyager import Voyager

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Please set OPENAI_API_KEY environment variable")


# Create Voyager instance with GPT-5.x
voyager = Voyager(
    mc_port=None,  # Will prompt or auto-detect
    openai_api_key=OPENAI_API_KEY,

    # GPT-5.1-codex for action agent (code-specialized, best for JS generation)
    action_agent_model_name="gpt-5.1-codex",

    # GPT-5.2 for reasoning-heavy agents
    curriculum_agent_model_name="gpt-5.2",
    critic_agent_model_name="gpt-5.2",

    # GPT-5-mini for lighter tasks (cost-effective)
    curriculum_agent_qa_model_name="gpt-5-mini",
    skill_manager_model_name="gpt-5-mini",

    # Optional tuning
    action_agent_task_max_retries=4,
    max_iterations=160,
)

# Start learning!
voyager.learn()
