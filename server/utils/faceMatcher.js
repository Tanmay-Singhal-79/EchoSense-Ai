/**
 * EchoSense AI Biometric Utility
 * Calculates Euclidean distance between two 128-dimensional facial descriptors
 * extracted by Deep Neural Network (Face Recognition Net).
 */

const MATCH_THRESHOLD = 0.52; // Standard face-api Euclidean distance threshold (lower is stricter)

/**
 * Validates whether an input is a valid 128-dimensional facial feature vector
 */
function isValidDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) return false;
  if (descriptor.length !== 128) return false;
  for (let i = 0; i < descriptor.length; i++) {
    if (typeof descriptor[i] !== 'number' || isNaN(descriptor[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Computes Euclidean Distance: d = sqrt( sum( (a[i] - b[i])^2 ) )
 */
function calculateEuclideanDistance(descriptorA, descriptorB) {
  if (!isValidDescriptor(descriptorA) || !isValidDescriptor(descriptorB)) {
    throw new Error('Invalid face descriptors provided for biometric verification.');
  }

  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = descriptorA[i] - descriptorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Verifies if candidate face matches the enrolled template
 */
function verifyFaceMatch(candidateDescriptor, enrolledDescriptor, threshold = MATCH_THRESHOLD) {
  const distance = calculateEuclideanDistance(candidateDescriptor, enrolledDescriptor);
  const isMatch = distance <= threshold;
  
  // Convert distance into confidence score (0% to 100%)
  // distance 0.2 -> ~95% confidence; distance 0.5 -> ~70% confidence
  const confidence = Math.max(0, Math.min(100, Math.round((1 - (distance / 0.75)) * 100)));

  return {
    isMatch,
    distance: parseFloat(distance.toFixed(4)),
    threshold,
    confidence,
  };
}

module.exports = {
  isValidDescriptor,
  calculateEuclideanDistance,
  verifyFaceMatch,
  MATCH_THRESHOLD,
};
