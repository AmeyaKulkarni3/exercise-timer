export type PhaseType = 'Startup' | 'Hip Raise' | 'Chest Raise' | 'Elbow Push' | 'Elbow Raise' | 
    'Head Arm Push' | 'Shoulder Shrug Left' | 'Shoulder Shrug Right' | 'Change';

export interface Phase {
    type: PhaseType;
    duration: number;
    round:number;
    sound?: 'single' | 'double';
}