import { IsEnum, IsNotEmpty } from 'class-validator';

enum EPriority {
  high = 'high',
  low = 'low',
  normal = 'normal'
}

export class ReqBody {
  constructor(Title: string, Description: string, Priority: EPriority) {
    this.Title = Title;
    this.Description = Description;
    this.Priority = Priority;
  }

  @IsNotEmpty()
  public Title: string;

  public Description: string;

  // @IsEnum(EPriority)
  @IsNotEmpty()
  public Priority: 'high' | 'low' | 'normal';
}
