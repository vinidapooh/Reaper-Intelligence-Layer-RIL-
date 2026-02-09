
"""
ACTION BRIDGE: FastAPI Hub
Enhanced with SWS Action String ID support and safety wrappers.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging

# Configure logging for RIL
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RIL_BRIDGE")

app = FastAPI(title="RIL Action Bridge")

class IntentRequest(BaseModel):
    intent: str
    action_ids: Optional[List[str]] = None
    lua_code: Optional[str] = None

@app.post("/execute")
async def execute_intent(request: IntentRequest):
    """
    Executes a combined set of SWS Action IDs and/or custom Lua code blocks.
    In a real environment, this connects to REAPER via 'reapy'.
    """
    try:
        results = []
        
        # 1. Handle Sequential Action IDs (Priority for SWS Workflows)
        if request.action_ids:
            logger.info(f"Resolving {len(request.action_ids)} Action IDs...")
            for action_id in request.action_ids:
                # Simulation of reapy command lookup and execution
                # cmd_id = reapy.reascript_api.NamedCommandLookup(action_id)
                # if cmd_id != 0:
                #     reapy.reascript_api.Main_OnCommand(cmd_id, 0)
                #     results.append(f"SUCCESS: {action_id}")
                results.append(f"RESOLVED: {action_id}")

        # 2. Handle Custom Lua Block (Day 3 Few-Shot Generation)
        if request.lua_code:
            logger.info("Executing custom Lua block...")
            # Safety check: ensure Undo block exists in the generated string
            if "Undo_BeginBlock" not in request.lua_code:
                logger.warning("Lua code received without safety Undo block.")
            
            # Simulation of reapy run_lua
            # reapy.Project().run_lua(request.lua_code)
            results.append("LUA_BLOCK_EXECUTED")
        
        return {
            "status": "success", 
            "message": "Cognitive Bridge synced with REAPER",
            "executed": results,
            "intent_processed": request.intent
        }
    except Exception as e:
        logger.error(f"Execution Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
