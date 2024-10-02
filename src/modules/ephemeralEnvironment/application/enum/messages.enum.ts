export enum MessagesEphemeralEnvironment {
  FARGATE_TASK_STARTED = 'Fargate task started:',
  FARGATE_TASK_NOT_STARTED = 'Fargate task not started',
  FARGATE_TASK_STARTED_SUCCESS = 'Fargate task started successfully',
  FARGATE_TASK_STOPPED = 'Fargate task stopped:',
  FARGATE_TASK_STOPPED_SUCCESS = 'Fargate task stopped successfully',
  NO_NETWORK_INTERFACE = 'No network interface found for the task.',
  NO_PUBLIC_IP = 'No public IP address found for the task.',
  PUBLIC_IP_RETRIEVED_SUCCESS = 'Public IP address retrieved successfully',
  TASK_INFO_RETRIEVED = 'Task information retrieved:',
  FAILED_TO_START_TASK = 'Failed to start Fargate task:',
  FAILED_TO_STOP_TASK = 'Failed to stop Fargate task:',
  FAILED_TO_RETRIEVE_PUBLIC_IP = 'Failed to retrieve public IP address:',
}
