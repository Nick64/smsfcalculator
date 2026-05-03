const KEY = "ewc-smsf-scenarios";

export function loadScenarios() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios) {
  try {
    localStorage.setItem(KEY, JSON.stringify(scenarios));
    return true;
  } catch {
    return false;
  }
}

export function addScenario(name, inputs) {
  const scenarios = loadScenarios();
  const scenario = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name || `Scenario ${scenarios.length + 1}`,
    inputs,
    savedAt: new Date().toISOString(),
  };
  scenarios.unshift(scenario);
  // Keep max 6 scenarios
  saveScenarios(scenarios.slice(0, 6));
  return scenario;
}

export function deleteScenario(id) {
  const scenarios = loadScenarios().filter((s) => s.id !== id);
  saveScenarios(scenarios);
  return scenarios;
}

export function renameScenario(id, name) {
  const scenarios = loadScenarios().map((s) =>
    s.id === id ? { ...s, name } : s,
  );
  saveScenarios(scenarios);
  return scenarios;
}
