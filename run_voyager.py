"""
Run Voyager with OpenAI GPT-4o.

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


# Create Voyager instance with GPT-4o
voyager = Voyager(
    mc_port=None,  # Will prompt or auto-detect
    openai_api_key=OPENAI_API_KEY,

    # GPT-4o for main agents (strong code generation)
    action_agent_model_name="gpt-4o",
    curriculum_agent_model_name="gpt-4o",
    critic_agent_model_name="gpt-4o",

    # GPT-4o-mini for lighter tasks (cheaper)
    curriculum_agent_qa_model_name="gpt-4o-mini",
    skill_manager_model_name="gpt-4o-mini",

    # Optional tuning
    action_agent_task_max_retries=4,
    max_iterations=160,
)

# Start learning!
voyager.learn()
