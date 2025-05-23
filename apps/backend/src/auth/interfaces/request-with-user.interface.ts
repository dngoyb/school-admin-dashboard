import { Request } from 'express';
import { User } from '@school-admin/database';

export interface RequestWithUser extends Request {
	user: User;
}
