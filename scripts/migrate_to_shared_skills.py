#!/usr/bin/env python3
"""
Migrate existing skills from ckpt/skill/ to shared_skills/

This script copies all existing skills to the shared skill library,
adding bot attribution metadata. Existing skills are attributed to
"legacy" bot since we don't know which bot originally created them.

Usage:
    python scripts/migrate_to_shared_skills.py
    python scripts/migrate_to_shared_skills.py --source ckpt/skill --dest shared_skills
"""

import os
import sys
import json
import shutil
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def migrate_skills(source_dir: str, dest_dir: str, bot_id: str = "legacy"):
    """
    Migrate skills from source to destination with attribution.

    Args:
        source_dir: Path to existing skill directory (e.g., ckpt/skill)
        dest_dir: Path to shared skill directory (e.g., shared_skills)
        bot_id: Bot ID to attribute migrated skills to
    """
    print(f"Migrating skills from {source_dir} to {dest_dir}")
    print(f"Attributing skills to: {bot_id}")

    # Create destination directories
    os.makedirs(f"{dest_dir}/code", exist_ok=True)
    os.makedirs(f"{dest_dir}/description", exist_ok=True)
    os.makedirs(f"{dest_dir}/vectordb", exist_ok=True)

    # Load existing skills.json if present
    source_skills_path = f"{source_dir}/skills.json"
    dest_skills_path = f"{dest_dir}/skills.json"

    if os.path.exists(dest_skills_path):
        print(f"Loading existing shared skills from {dest_skills_path}")
        with open(dest_skills_path, 'r') as f:
            shared_skills = json.load(f)
    else:
        shared_skills = {}

    if not os.path.exists(source_skills_path):
        print(f"No skills.json found at {source_skills_path}")
        # Try to reconstruct from code files
        code_dir = f"{source_dir}/code"
        if os.path.exists(code_dir):
            print(f"Reconstructing from code files in {code_dir}")
            source_skills = {}
            for filename in os.listdir(code_dir):
                if filename.endswith('.js'):
                    skill_name = filename[:-3]  # Remove .js
                    code_path = f"{code_dir}/{filename}"
                    desc_path = f"{source_dir}/description/{skill_name}.txt"

                    with open(code_path, 'r') as f:
                        code = f.read()

                    description = ""
                    if os.path.exists(desc_path):
                        with open(desc_path, 'r') as f:
                            description = f.read()

                    source_skills[skill_name] = {
                        "code": code,
                        "description": description
                    }
            print(f"Reconstructed {len(source_skills)} skills from code files")
        else:
            print("No code directory found. Nothing to migrate.")
            return
    else:
        with open(source_skills_path, 'r') as f:
            source_skills = json.load(f)

    # Migrate each skill
    migrated = 0
    skipped = 0

    for skill_name, skill_data in source_skills.items():
        if skill_name in shared_skills:
            print(f"  Skipping {skill_name} (already exists in shared)")
            skipped += 1
            continue

        # Add attribution metadata
        shared_skills[skill_name] = {
            "code": skill_data.get("code", ""),
            "description": skill_data.get("description", ""),
            "created_by": bot_id,
            "created_by_name": "Legacy Bot" if bot_id == "legacy" else bot_id,
            "created_at": datetime.now().isoformat(),
            "version": 1,
            "success_count": 0,
            "fail_count": 0,
            "migrated_from": source_dir,
        }

        # Copy code file
        src_code = f"{source_dir}/code/{skill_name}.js"
        dst_code = f"{dest_dir}/code/{skill_name}.js"
        if os.path.exists(src_code) and not os.path.exists(dst_code):
            shutil.copy2(src_code, dst_code)

        # Copy description file
        src_desc = f"{source_dir}/description/{skill_name}.txt"
        dst_desc = f"{dest_dir}/description/{skill_name}.txt"
        if os.path.exists(src_desc) and not os.path.exists(dst_desc):
            shutil.copy2(src_desc, dst_desc)

        print(f"  Migrated: {skill_name}")
        migrated += 1

    # Save updated shared skills
    with open(dest_skills_path, 'w') as f:
        json.dump(shared_skills, f, indent=2)

    print(f"\nMigration complete!")
    print(f"  Migrated: {migrated} skills")
    print(f"  Skipped: {skipped} skills (already existed)")
    print(f"  Total shared skills: {len(shared_skills)}")
    print(f"\nNote: You'll need to rebuild the vectordb on first run.")
    print(f"The SharedSkillManager will do this automatically.")


def main():
    parser = argparse.ArgumentParser(description="Migrate skills to shared library")
    parser.add_argument(
        "--source",
        default="ckpt/skill",
        help="Source skill directory (default: ckpt/skill)"
    )
    parser.add_argument(
        "--dest",
        default="shared_skills",
        help="Destination shared skill directory (default: shared_skills)"
    )
    parser.add_argument(
        "--bot-id",
        default="legacy",
        help="Bot ID to attribute migrated skills to (default: legacy)"
    )

    args = parser.parse_args()

    # Change to Voyager root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    voyager_dir = os.path.dirname(script_dir)
    os.chdir(voyager_dir)

    migrate_skills(args.source, args.dest, args.bot_id)


if __name__ == "__main__":
    main()
