import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface ActiveUserData {
  id: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData = request.user;

    return data ? user?.[data] : user;
  },
);