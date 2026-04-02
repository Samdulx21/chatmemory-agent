import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ChatMessageDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
