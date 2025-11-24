#!/usr/bin/env python3
"""
Merge all extracted positions from DeepSeek (chunks 2,4,5) and Claude (chunks 1,3,6,7,8)
"""

import json

# DeepSeek results - load from file
with open('sistematizacija-knowledge-base-backup.json', 'r', encoding='utf-8') as f:
    deepseek_data = json.load(f)
    deepseek_positions = deepseek_data['positions']

print(f"✅ DeepSeek rezultati: {len(deepseek_positions)} pozicija (chunk 2, 4, 5)\n")

# Count positions by chunk to understand coverage
chunk_2_4_5_positions = len(deepseek_positions)

# Now we need to manually count from agent outputs
# Based on agent outputs:
# - Agent 1 (chunk 1): positions 1-18 = 18 positions
# - Agent 2 (chunk 3): positions 26-45 = 20 positions
# - Agent 3 (chunk 6): positions 61-65 = 5 positions
# - Agent 4 (chunk 7): positions 79-93 = 15 positions
# - Agent 5 (chunk 8): positions 116-136 = 21 positions

claude_positions_count = 18 + 20 + 5 + 15 + 21
total_estimated = chunk_2_4_5_positions + claude_positions_count

print(f"📊 Claude rezultati: ~{claude_positions_count} pozicija (chunk 1, 3, 6, 7, 8)")
print(f"📊 Ukupno pozicija: ~{total_estimated} od 137\n")

print("💡 Da završimo merge, potrebno je:")
print("   1. Sačuvati JSON output iz svakog Claude agenta")
print("   2. Učitati ih u Python i kombinovati sa DeepSeek rezultatima")
print("   3. Sortirati po positionNumber")
print("   4. Proveriti duplikate")
print("   5. Sačuvati finalnu bazu znanja\n")
