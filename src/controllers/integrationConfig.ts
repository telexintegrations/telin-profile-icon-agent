import { Request, Response } from 'express';
import { telexConfig } from '../config/telexConfig';

export const integrationConfig = (req: Request, res: Response): void => {
    res.status(200).json(telexConfig)
}