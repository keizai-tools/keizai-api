import * as dotenv from 'dotenv';
import * as scanner from 'sonarqube-scanner';

dotenv.config();

scanner(
  {
    serverUrl: process.env.SONAR_SERVER_URL,
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectName': 'Template Core Api ',
      'sonar.projectDescription': 'Template base for core api',
      'sonar.sources': 'src',
      'sonar.tests': 'src,test',
      'sonar.test.inclusions': 'src/**/*.spec.ts, test/**/e2e-spec.ts',
      'sonar.exclusions': 'data/migrations/**',
    },
  },
  () => process.exit(),
);
