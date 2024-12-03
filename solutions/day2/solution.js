export default function solution(input) {
    return input.reduce((safeCount, report) => {
        const levels = report.split(' ').map(Number);
        
        // Check if sequence is valid
        let isValid = true;
        let isIncreasing = null;
        
        for (let i = 1; i < levels.length; i++) {
            const diff = levels[i] - levels[i-1];
            
            // Set direction on first comparison
            if (isIncreasing === null) {
                isIncreasing = diff > 0;
            }
            
            // Check if difference is between 1 and 3
            if (Math.abs(diff) < 1 || Math.abs(diff) > 3) {
                isValid = false;
                break;
            }
            
            // Check if direction remains consistent
            if ((isIncreasing && diff <= 0) || (!isIncreasing && diff >= 0)) {
                isValid = false;
                break;
            }
        }
        
        return safeCount + (isValid ? 1 : 0);
    }, 0);
}