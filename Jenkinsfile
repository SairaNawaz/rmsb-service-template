// Global environment variables expected (set in Jenkins → Manage Jenkins → System → Global properties):
//   GHCR_OWNER            — GHCR owner (lowercase GitHub username)
//   DASHBOARD_JENKINS_URL — e.g. https://your-domain/jenkins
//   DASHBOARD_JOB         — e.g. rmsb-dashboard
//
// Per-job environment variables (set in Jenkins job → Build Environment):
//   SERVICE_NAME          — service ID from dashboard callout (e.g. s2)
//   VITE_BASE_PATH        — path prefix from dashboard callout (e.g. /s2)

pipeline {
    agent any

    environment {
        REGISTRY = 'ghcr.io'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Image') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        echo $GITHUB_TOKEN | docker login ghcr.io -u $GHCR_OWNER --password-stdin
                        docker build \
                            --build-arg VITE_BASE_PATH=${VITE_BASE_PATH:-/} \
                            -t $REGISTRY/$GHCR_OWNER/rmsb-${SERVICE_NAME}-api:latest \
                            .
                        docker push $REGISTRY/$GHCR_OWNER/rmsb-${SERVICE_NAME}-api:latest
                    '''
                }
            }
        }

        stage('Trigger Dashboard Deploy') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'jenkins-admin',
                        usernameVariable: 'JENKINS_USER',
                        passwordVariable: 'JENKINS_TOKEN'
                    )
                ]) {
                    sh '''
                        curl -s -o /dev/null -w "%{http_code}" -X POST \
                            "$DASHBOARD_JENKINS_URL/job/$DASHBOARD_JOB/build?token=rmsb-deploy-token" \
                            --user "$JENKINS_USER:$JENKINS_TOKEN"
                    '''
                }
            }
        }
    }

    post {
        success { echo 'Service deployed successfully.' }
        failure { echo 'Pipeline failed.' }
    }
}
