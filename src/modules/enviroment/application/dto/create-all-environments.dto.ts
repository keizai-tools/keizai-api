import { CreateEnviromentDto } from './create-enviroment.dto';

export type CreateEnvironmentsDto = Omit<CreateEnviromentDto, 'collectionId'>;
