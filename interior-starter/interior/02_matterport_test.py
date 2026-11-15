"""STEP 2: Check that your Matterport key works. Do this once by hand.

You must fill in two things in .env (see README, 'Finding the Matterport URL'):
  MATTERPORT_GRAPHQL_URL   the address the playground sends queries to
  MATTERPORT_AUTH_HEADER   the full Authorization header value the playground sends

Put the query that WORKS in the playground into query.graphql, then:
  python 02_matterport_test.py MODEL_ID
"""
import json, os, sys
import requests
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("MATTERPORT_GRAPHQL_URL")
auth = os.environ.get("MATTERPORT_AUTH_HEADER")
if not url or not auth:
    sys.exit("Fill in MATTERPORT_GRAPHQL_URL and MATTERPORT_AUTH_HEADER in .env first (see README).")
if len(sys.argv) < 2:
    sys.exit("Usage: python 02_matterport_test.py MODEL_ID")

query = open("query.graphql", encoding="utf-8").read()
r = requests.post(url, json={"query": query, "variables": {"modelId": sys.argv[1]}},
                  headers={"Authorization": auth, "Content-Type": "application/json"}, timeout=60)
print("HTTP", r.status_code)
print(json.dumps(r.json(), indent=2)[:4000])
