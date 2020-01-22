export class StringExtensions {
    static toKebabCase(value: string) {
        return value.toLowerCase().split(' ').join('-');
    }
    
    static fromKebabCase(value: string) {
        return value.split('-').map(s => this.capitalize(s)).join(' ');
    }
    
    static capitalize(value: string) {
        value = value.toLowerCase();
        return value[0].toUpperCase() + value.substring(1);
    }

    static formatTime(total: number) : string {
        if (isNaN(total))
            return '00:00:00';
        
        const seconds = Math.floor(total%60),
            minutes = Math.floor(total/60%60),
            hours = Math.floor(total/60/60%60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}