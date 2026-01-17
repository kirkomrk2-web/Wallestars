// This code is intended for an N8N Code Node
// Input: Prometheus Metrics Text (from Supabase API)
// Output: JSON Object

const metricsText = items[0].json.data; // Assuming raw text is in 'data' field
const lines = metricsText.split('\n');
const metrics = {};

for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
        continue;
    }

    // Parse metric line: "metric_name{label="value"} 123.45"
    const match = line.match(/^([a-zA-Z0-9_]+)(?:\{([^}]+)\})?\s+(.+)$/);

    if (match) {
        const name = match[1];
        const labelsStr = match[2];
        const valueStr = match[3];
        const value = parseFloat(valueStr);

        // Skip if value is not a number (e.g. infinite)
        if (isNaN(value)) continue;

        // Simple storage: just use the name if simple, or composite key if labels exist
        // For this specific use case (checking thresholds), we prioritize specific known metrics

        // Example: supabase_cpu_usage
        if (!metrics[name]) {
            metrics[name] = value;
        } else {
            // If multiple values exist (different labels), we might want to sum them or keep the max
            // For CPU/RAM, typically we want the max or the main instance value
            // Here we just keep the last one or accumulate if array needed
            // For simplicity, let's keep it simple: specific keys for critical metrics
        }

        // Check for specific critical metrics and normalize names if needed
        if (name.includes('cpu_usage')) metrics.cpu_usage_percent = value;
        if (name.includes('ram_usage')) metrics.ram_usage_percent = value;
        if (name.includes('active_connections')) metrics.db_connections = value;
    }
}

return [{ json: metrics }];
