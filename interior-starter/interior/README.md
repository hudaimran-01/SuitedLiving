# Interior accessibility (Musa's part)

Setup (once), in a terminal inside this folder:
    py -m pip install -r requirements.txt
    copy .env.example .env        (then open .env and fill in the keys)

Run in order:
    py 01_build_index.py --data "C:\Users\YOU\Downloads\costar-hackathon-kit\data"
    py 03_analyze_photos.py --max 5
    py 04_score.py
Optional, later:
    py 02_matterport_test.py MODEL_ID

Output for the team: output/interior_scores.json
