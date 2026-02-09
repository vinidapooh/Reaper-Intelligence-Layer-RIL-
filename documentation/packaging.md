
# Packaging RIL for Standalone Distribution

To turn your Python backend into a 6-figure standalone product, follow these exact steps.

### 1. Environment Setup
Use a clean virtual environment to minimize binary size.
```bash
python -m venv dist_env
source dist_env/bin/activate
pip install fastapi uvicorn reapy lancedb sentence-transformers pyinstaller
```

### 2. PyInstaller Configuration
Create a `build_ril.spec` file or use the CLI. Note that `sentence-transformers` and `lancedb` often require hidden-import flags.

```bash
pyinstaller --noconfirm --onefile --windowed \
  --name "RIL_Intelligence_Hub" \
  --add-data "ril_memory:ril_memory" \
  --hidden-import "sentence_transformers" \
  --hidden-import "lancedb" \
  backend/main.py
```

### 3. REAPER Integration
The resulting `.exe` (Windows) or `.pkg` (Mac) should be placed in the REAPER `Scripts` folder or registered as a Startup Action.

### The "Secret Sauce": Hallucination Prevention
1. **The RAG Sandbox**: Never send a prompt to the LLM without context. Our Knowledge Engine retrieves the exact API signature from DuckDB first.
2. **Schema Enforcement**: Use Gemini's `responseSchema` (as seen in `services/gemini.ts`) to force a specific JSON structure.
3. **Execution Verification**: The Python bridge should wrap all generated Lua in an `reaper.Undo_BeginBlock()` and `reaper.Undo_EndBlock()` to ensure the user can always Ctrl+Z a bad AI decision.
