import { CreateEnvironmentDto } from './create-environment.dto';

export type CreateEnvironmentsDto = Omit<CreateEnvironmentDto, 'collectionId'>;
