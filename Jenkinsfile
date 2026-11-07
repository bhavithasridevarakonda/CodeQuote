pipeline {
    agent any

    environment {
        // Docker Hub repository and image configuration
        // Credentials stored safely in Jenkins: 'dockerhub-credentials'
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        KUBECONFIG_CREDENTIALS_ID = 'k8s-kubeconfig'
        IMAGE_NAME = 'yourdockerhubuser/codequote'
        APP_PORT = '80'
        SMOKE_TEST_PORT = '8088'
        K8S_NAMESPACE = 'default'
    }

    options {
        // Fail the pipeline immediately if any stage fails; terminate stale builds
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "=========================================="
                echo "Stage 1: Checking out source code from Git"
                echo "=========================================="
                checkout scm
                sh 'git log -1 --pretty=format:"Commit: %h by %an - %s (%ci)"'
            }
        }

        stage('Test') {
            steps {
                echo "=========================================="
                echo "Stage 2: Running Automated Shell Test Suite"
                echo "=========================================="
                sh 'chmod +x tests/check.sh'
                sh './tests/check.sh'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "=========================================="
                echo "Stage 3: Building Nginx Alpine Docker Image"
                echo "=========================================="
                script {
                    sh """
                        docker build \
                            --tag ${IMAGE_NAME}:${BUILD_NUMBER} \
                            --tag ${IMAGE_NAME}:latest \
                            .
                    """
                }
            }
        }

        stage('Container Smoke Test') {
            steps {
                echo "=========================================="
                echo "Stage 4: Running Container Smoke Test"
                echo "=========================================="
                script {
                    try {
                        // Start temporary container for smoke testing
                        sh """
                            docker run -d --name codequote-smoke-${BUILD_NUMBER} \
                                -p ${SMOKE_TEST_PORT}:80 ${IMAGE_NAME}:${BUILD_NUMBER}
                        """
                        
                        // Wait briefly for Nginx to initialize
                        sh 'sleep 3'

                        // Test HTTP 200 response on root
                        sh """
                            HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${SMOKE_TEST_PORT}/)
                            if [ "\$HTTP_STATUS" != "200" ]; then
                                echo "ERROR: Smoke test failed on root path! HTTP Status: \$HTTP_STATUS"
                                exit 1
                            fi
                            echo "[PASS] Root URL returned HTTP 200 OK"
                        """

                        // Test Kubernetes health probe endpoint /health.html
                        sh """
                            HEALTH_RESPONSE=\$(curl -s http://localhost:${SMOKE_TEST_PORT}/health.html | tr -d '[:space:]')
                            if [ "\$HEALTH_RESPONSE" != "OK" ]; then
                                echo "ERROR: Health probe returned '\$HEALTH_RESPONSE' instead of 'OK'!"
                                exit 1
                            fi
                            echo "[PASS] /health.html probe returned 'OK'"
                        """
                    } finally {
                        // Always clean up the temporary smoke test container
                        echo "Cleaning up temporary smoke test container..."
                        sh """
                            docker rm -f codequote-smoke-${BUILD_NUMBER} || true
                        """
                    }
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                echo "=========================================="
                echo "Stage 5: Secure Docker Hub Authentication & Push"
                echo "=========================================="
                // Credentials stored safely in Jenkins credentials manager (no hardcoded secrets)
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "=========================================="
                echo "Stage 6: Deploying to Kubernetes Cluster"
                echo "=========================================="
                script {
                    // Update deployment manifest dynamically with the new immutable build tag
                    sh """
                        sed -i.bak 's|image:.*|image: ${IMAGE_NAME}:${BUILD_NUMBER}|g' k8s/deployment.yaml
                        rm -f k8s/deployment.yaml.bak
                    """

                    // Apply Kubernetes manifests using Jenkins credentials
                    // If running in cluster with service account or kubeconfig credentials
                    sh """
                        kubectl apply -f k8s/deployment.yaml --namespace=${K8S_NAMESPACE}
                        kubectl apply -f k8s/service.yaml --namespace=${K8S_NAMESPACE}
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "=========================================="
                echo "Stage 7: Verifying Rolling Update Rollout"
                echo "=========================================="
                sh """
                    kubectl rollout status deployment/codequote-deployment --namespace=${K8S_NAMESPACE} --timeout=90s
                    echo "Checking running pods..."
                    kubectl get pods -l app=codequote --namespace=${K8S_NAMESPACE} -o wide
                    echo "Checking service endpoints..."
                    kubectl get svc codequote-service --namespace=${K8S_NAMESPACE}
                """
            }
        }
    }

    post {
        always {
            echo "Pipeline run completed."
            // Clean up untagged or temporary images to prevent disk space exhaustion
            sh 'docker image prune -f || true'
        }
        success {
            echo "======================================================="
            echo "SUCCESS: CodeQuote ${BUILD_NUMBER} deployed successfully!"
            echo "======================================================="
        }
        failure {
            echo "======================================================="
            echo "FAILURE: Pipeline failed! Examine the stage logs above."
            echo "======================================================="
        }
    }
}
