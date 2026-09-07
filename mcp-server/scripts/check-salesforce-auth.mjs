import { createKeychainReader } from '../src/salesforce-auth.mjs';
import { runAuthDiagnostic } from '../src/auth-diagnostic.mjs';

if (process.argv.length !== 3 || process.argv[2] !== '--approved-token-check') {
  console.error('APPROVED_TOKEN_CHECK_REQUIRED'); process.exitCode = 1;
} else {
  try {
    const report = await runAuthDiagnostic({ readCredentials: createKeychainReader({ enabled: true }) });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  } catch {
    console.error('AUTH_CHECK_FAILED_NO_SECRET_OUTPUT'); process.exitCode = 1;
  }
}
