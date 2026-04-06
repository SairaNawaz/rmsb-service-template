// Global environment variables expected (set in Jenkins → Manage Jenkins → System → Global properties):
//   GHCR_OWNER            — GHCR owner (lowercase GitHub username)
//   DASHBOARD_JENKINS_URL — e.g. https://your-domain/jenkins
//   DASHBOARD_JOB         — e.g. rmsb-dashboard
//   DASHBOARD_REPO        — dashboard GitHub repo (e.g. kloudius/rmsb-dashboard)
//
// Per-job environment variables (set in Jenkins job → Build Environment):
//   SERVICE_NAME          — service ID from dashboard callout (e.g. s2)

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
                            --build-arg VITE_BASE_PATH=/${SERVICE_NAME} \
                            -t $REGISTRY/$GHCR_OWNER/rmsb-${SERVICE_NAME}-api:latest \
                            .
                        docker push $REGISTRY/$GHCR_OWNER/rmsb-${SERVICE_NAME}-api:latest
                    '''
                }
            }
        }

        stage('Publish Compose to Dashboard') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        git clone https://$GITHUB_TOKEN@github.com/$DASHBOARD_REPO.git _dashboard
                        mkdir -p _dashboard/services
                        sed \
                          -e "s/\${SERVICE_NAME}/${SERVICE_NAME}/g" \
                          -e "s/\${GHCR_OWNER}/${GHCR_OWNER}/g" \
                          docker-compose.service.yml \
                          > _dashboard/services/docker-compose.${SERVICE_NAME}.service.yml
                        cd _dashboard
                        git config user.email "ci@rmsb"
                        git config user.name  "RMSB CI"
                        git add services/docker-compose.${SERVICE_NAME}.service.yml
                        git diff --cached --quiet || git commit -m "chore: update compose for ${SERVICE_NAME}"
                        git push
                        cd .. && rm -rf _dashboard
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
