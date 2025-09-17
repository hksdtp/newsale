
# Example Human-MCP + Serena MCP Workflow

## 1. Visual Analysis với Human-MCP
```json
{
  "tool": "eyes_analyze",
  "input": {
    "source": "demo-ui-screenshot.png",
    "type": "image", 
    "analysis_type": "accessibility",
    "check_accessibility": true
  }
}
```

## 2. Find Code với Serena MCP
```json
{
  "tool": "search_for_pattern",
  "input": {
    "substring_pattern": "issue-1|issue-2|issue-3",
    "paths_include_glob": "*.html,*.css,*.tsx"
  }
}
```

## 3. Fix Issues với Serena MCP
```json
{
  "tool": "replace_regex",
  "input": {
    "relative_path": "demo-ui.html",
    "regex": "color: #ccc;\s*background: #ddd;",
    "repl": "color: #333; background: #f8f9fa;",
    "allow_multiple_occurrences": true
  }
}
```

## 4. Verify với Human-MCP
```json
{
  "tool": "eyes_compare", 
  "input": {
    "source1": "before-fix.png",
    "source2": "after-fix.png",
    "comparison_type": "accessibility"
  }
}
```
