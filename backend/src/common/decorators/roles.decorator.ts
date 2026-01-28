import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../database/entities';

export const Roles = createParamDecorator((roles: UserRole[], ctx: ExecutionContext) => {
  return roles;
});
