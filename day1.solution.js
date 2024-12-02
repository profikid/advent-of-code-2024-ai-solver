function calculateTotalDistance(leftList, rightList) {
    // Check if lists have equal length
    if (leftList.length !== rightList.length) {
        throw new Error('Lists must be of equal length');
    }

    // Handle empty lists
    if (leftList.length === 0) return 0;

    // Sort both lists in ascending order
    const sortedLeft = [...leftList].sort((a, b) => a - b);
    const sortedRight = [...rightList].sort((a, b) => a - b);

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < sortedLeft.length; i++) {
        totalDistance += Math.abs(sortedLeft[i] - sortedRight[i]);
    }

    return totalDistance;
}

module.exports = {
    calculateTotalDistance
};