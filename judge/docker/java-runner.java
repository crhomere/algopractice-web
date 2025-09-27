import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;

/**
 * Java code execution runner for the judge system.
 * Handles secure execution of user-submitted Java code with test cases.
 */
public class runner {
    
    private static class ExecutionResult {
        int exitCode = 1;
        String stdout = "";
        String stderr = "";
        long runtimeMs = 0;
        boolean killed = false;
    }
    
    public static void main(String[] args) {
        try {
            // Read input from stdin
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            StringBuilder inputBuilder = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                inputBuilder.append(line).append("\n");
            }
            
            String inputData = inputBuilder.toString().trim();
            
            // Parse JSON input (simplified parsing for this example)
            String sourceCode = extractValue(inputData, "sourceCode");
            String testInput = extractValue(inputData, "testInput");
            long timeLimitMs = Long.parseLong(extractValue(inputData, "timeLimitMs", "5000"));
            
            if (sourceCode.isEmpty()) {
                System.out.println("{\"error\": \"No source code provided\"}");
                System.exit(1);
            }
            
            // Execute the code
            ExecutionResult result = executeJavaCode(sourceCode, testInput, timeLimitMs);
            
            // Output result as JSON
            System.out.println(resultToJson(result));
            
        } catch (Exception e) {
            System.out.println("{\"error\": \"Runner error: " + e.getMessage() + "\"}");
            System.exit(1);
        }
    }
    
    private static ExecutionResult executeJavaCode(String sourceCode, String testInput, long timeLimitMs) {
        ExecutionResult result = new ExecutionResult();
        long startTime = System.currentTimeMillis();
        
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("java_runner");
            Path sourceFile = tempDir.resolve("Solution.java");
            Path classFile = tempDir.resolve("Solution.class");
            
            // Write source code to file
            Files.write(sourceFile, sourceCode.getBytes());
            
            // Compile the Java code
            Process compileProcess = new ProcessBuilder("javac", sourceFile.toString())
                .directory(tempDir.toFile())
                .start();
            
            int compileExitCode = compileProcess.waitFor();
            if (compileExitCode != 0) {
                result.stderr = "Compilation failed";
                return result;
            }
            
            // Execute the compiled code
            ProcessBuilder executeBuilder = new ProcessBuilder("java", "-cp", tempDir.toString(), "Solution")
                .directory(tempDir.toFile());
            
            Process executeProcess = executeBuilder.start();
            
            // Set up timeout
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<?> future = executor.submit(() -> {
                try {
                    return executeProcess.waitFor();
                } catch (InterruptedException e) {
                    executeProcess.destroyForcibly();
                    result.killed = true;
                    return -1;
                }
            });
            
            // Send input to the process
            if (testInput != null && !testInput.isEmpty()) {
                try (OutputStreamWriter writer = new OutputStreamWriter(executeProcess.getOutputStream())) {
                    writer.write(testInput);
                    writer.flush();
                    writer.close();
                }
            }
            
            // Wait for execution with timeout
            try {
                future.get(timeLimitMs, TimeUnit.MILLISECONDS);
                result.exitCode = executeProcess.exitValue();
            } catch (TimeoutException e) {
                executeProcess.destroyForcibly();
                result.killed = true;
                result.stderr = "Execution timed out";
            }
            
            // Read output
            try (BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(executeProcess.getInputStream()));
                 BufferedReader stderrReader = new BufferedReader(new InputStreamReader(executeProcess.getErrorStream()))) {
                
                StringBuilder stdout = new StringBuilder();
                StringBuilder stderr = new StringBuilder();
                
                String line;
                while ((line = stdoutReader.readLine()) != null) {
                    stdout.append(line).append("\n");
                }
                while ((line = stderrReader.readLine()) != null) {
                    stderr.append(line).append("\n");
                }
                
                result.stdout = stdout.toString().trim();
                result.stderr = stderr.toString().trim();
            }
            
            executor.shutdown();
            
            // Clean up temporary files
            try {
                Files.deleteIfExists(sourceFile);
                Files.deleteIfExists(classFile);
                Files.deleteIfExists(tempDir);
            } catch (IOException e) {
                // Ignore cleanup errors
            }
            
        } catch (Exception e) {
            result.stderr = "Execution error: " + e.getMessage();
        } finally {
            result.runtimeMs = System.currentTimeMillis() - startTime;
        }
        
        return result;
    }
    
    private static String extractValue(String json, String key) {
        return extractValue(json, key, "");
    }
    
    private static String extractValue(String json, String key, String defaultValue) {
        try {
            int startIndex = json.indexOf("\"" + key + "\"");
            if (startIndex == -1) return defaultValue;
            
            startIndex = json.indexOf(":", startIndex) + 1;
            while (startIndex < json.length() && Character.isWhitespace(json.charAt(startIndex))) {
                startIndex++;
            }
            
            if (startIndex >= json.length()) return defaultValue;
            
            char quote = json.charAt(startIndex);
            if (quote != '"') return defaultValue;
            
            startIndex++;
            int endIndex = startIndex;
            while (endIndex < json.length() && json.charAt(endIndex) != quote) {
                if (json.charAt(endIndex) == '\\') endIndex++;
                endIndex++;
            }
            
            if (endIndex >= json.length()) return defaultValue;
            
            return json.substring(startIndex, endIndex);
        } catch (Exception e) {
            return defaultValue;
        }
    }
    
    private static String resultToJson(ExecutionResult result) {
        return String.format(
            "{\"exitCode\":%d,\"stdout\":\"%s\",\"stderr\":\"%s\",\"runtimeMs\":%d,\"killed\":%b}",
            result.exitCode,
            escapeJson(result.stdout),
            escapeJson(result.stderr),
            result.runtimeMs,
            result.killed
        );
    }
    
    private static String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
