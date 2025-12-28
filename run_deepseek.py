"""
Example script to run Voyager with DeepSeek API.

Before running:
1. Set your DEEPSEEK_API_KEY environment variable
2. Set your OPENAI_API_KEY environment variable (for embeddings only - very cheap)
3. Have Minecraft 1.19 running with Fabric mods installed
4. Open your world to LAN and note the port number

Usage:
    python run_deepseek.py
"""

import os
from voyager import Voyager

# DeepSeek configuration
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
DEEPSEEK_API_BASE = "https://api.deepseek.com"

# OpenAI key is still needed for embeddings (skill retrieval)
# This is very cheap: ~$0.0001 per 1K tokens
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not DEEPSEEK_API_KEY:
    raise ValueError("Please set DEEPSEEK_API_KEY environment variable")
if not OPENAI_API_KEY:
    raise ValueError("Please set OPENAI_API_KEY environment variable (needed for embeddings)")


# Create Voyager instance with DeepSeek
voyager = Voyager(
    mc_port=None,  # Will prompt or auto-detect
    openai_api_key=DEEPSEEK_API_KEY,  # DeepSeek uses same auth format
    openai_api_base=DEEPSEEK_API_BASE,

    # DeepSeek model names
    # Use "deepseek-chat" for general tasks, "deepseek-coder" for code-heavy tasks
    action_agent_model_name="deepseek-chat",
    curriculum_agent_model_name="deepseek-chat",
    curriculum_agent_qa_model_name="deepseek-chat",
    critic_agent_model_name="deepseek-chat",
    skill_manager_model_name="deepseek-chat",

    # Optional: adjust these based on your needs
    action_agent_task_max_retries=4,
    max_iterations=160,
)

# Start learning!
voyager.learn()
