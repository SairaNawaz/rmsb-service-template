pipeline {
    agent any

    environment {
        REGISTRY             = 'ghcr.io'
        OWNER                = 'sairanawaz'
        DASHBOARD_JENKINS_URL = 'https://microservces.duckdns.org/jenkins'
        DASHBOARD_JOB        = 'rmsb-dashboard'
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
                        echo $GITHUB_TOKEN | docker login ghcr.io -u sairanawaz --password-stdin
                        docker build \
                            --build-arg VITE_BASE_PATH=${VITE_BASE_PATH:-/} \
                            -t $REGISTRY/$OWNER/rmsb-${SERVICE_NAME}-api:latest \
                            .
                        docker push $REGISTRY/$OWNER/rmsb-${SERVICE_NAME}-api:latest
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
