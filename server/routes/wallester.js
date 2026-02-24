import express from 'express';

const router = express.Router();

/**
 * POST /api/wallester/check-eligibility
 * Check if a Bulgarian company owner is eligible for Wallester card
 *
 * Request body:
 * {
 *   firstName: string,
 *   middleName: string,
 *   lastName: string
 * }
 *
 * Response:
 * {
 *   eligible: boolean,
 *   reason: string,
 *   companyName?: string,
 *   details?: object
 * }
 */
router.post('/check-eligibility', async (req, res) => {
  try {
    const { firstName, middleName, lastName } = req.body;

    // Validate input
    if (!firstName || !middleName || !lastName) {
      return res.status(400).json({
        eligible: false,
        reason: 'Моля, попълнете всички три имена',
        details: {}
      });
    }

    // Clean and format names
    const cleanName = (name) => name.trim().toUpperCase();
    const formattedFirstName = cleanName(firstName);
    const formattedMiddleName = cleanName(middleName);
    const formattedLastName = cleanName(lastName);

    console.log(`Checking eligibility for user (names redacted)`);

    // Try to query the Bulgarian Trade Register
    // NOTE: The actual API endpoint for the Bulgarian Trade Register might require authentication
    // and specific API keys. This is a mock implementation that demonstrates the structure.

    let companyData = null;
    let tradeRegisterAvailable = false;

    try {
      // Attempt to query Bulgarian Trade Register API
      // The actual endpoint might be different and require authentication
      const tradeRegisterUrl = 'https://portal.registryagency.bg/CR/api/Search';

      // Note: This is a simplified example. The actual API might have different parameters
      // and authentication requirements. For now, we'll use a mock response.

      // Uncomment and modify when real API access is available:
      /*
      const response = await fetch(tradeRegisterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if required
        },
        body: JSON.stringify({
          firstName: formattedFirstName,
          middleName: formattedMiddleName,
          lastName: formattedLastName,
          searchType: 'person'
        })
      });

      if (response.ok) {
        companyData = await response.json();
        tradeRegisterAvailable = true;
      }
      */
    } catch (apiError) {
      console.log('Trade Register API not available, using mock data:', apiError.message);
    }

    // Mock data for demonstration purposes
    // In production, this should be replaced with real API calls
    if (!tradeRegisterAvailable) {
      companyData = generateMockCompanyData(
        formattedFirstName,
        formattedMiddleName,
        formattedLastName
      );
    }

    // Check eligibility criteria
    const eligibilityCheck = checkEligibilityCriteria(companyData);

    res.json(eligibilityCheck);

  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      eligible: false,
      reason: 'Грешка при проверка на данните. Моля, опитайте отново.',
      details: {
        error: error.message
      }
    });
  }
});

/**
 * Generate mock company data for demonstration
 * In production, this should be replaced with real Trade Register API calls
 */
function generateMockCompanyData(firstName, middleName, lastName) {
  // Simulate different scenarios based on name patterns
  const fullName = `${firstName} ${middleName} ${lastName}`;
  const nameHash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use name hash to deterministically generate mock data
  const companyTypes = ['ООД', 'ЕООД', 'АД', 'ЕТ'];
  const companyType = companyTypes[nameHash % companyTypes.length];

  const hasExistingAccount = (nameHash % 5) === 0; // 20% chance
  const isBlacklisted = (nameHash % 10) === 0; // 10% chance
  const ownershipPercentage = 50 + (nameHash % 51); // 50-100%

  const companyName = `${lastName} ${companyType}`;

  return {
    found: true,
    companies: [
      {
        name: companyName,
        type: companyType,
        ownerName: fullName,
        ownershipPercentage: ownershipPercentage,
        hasExistingWallesterAccount: hasExistingAccount,
        isBlacklisted: isBlacklisted,
        registrationNumber: `BG${100000000 + (nameHash % 900000000)}`,
        registrationDate: new Date(2015 + (nameHash % 10), (nameHash % 12), 1 + (nameHash % 28))
          .toISOString()
          .split('T')[0]
      }
    ]
  };
}

/**
 * Check if company meets eligibility criteria for Wallester
 */
function checkEligibilityCriteria(companyData) {
  // No companies found
  if (!companyData || !companyData.found || !companyData.companies || companyData.companies.length === 0) {
    return {
      eligible: false,
      reason: 'Не са намерени фирми, регистрирани на това име в Търговския регистър',
      details: {}
    };
  }

  // Check each company for eligibility
  for (const company of companyData.companies) {
    // Criterion 1: Must be ООД or ЕООД
    if (company.type !== 'ООД' && company.type !== 'ЕООД') {
      continue; // Skip this company, check next one
    }

    // Criterion 2: Owner must have at least 50% ownership
    if (company.ownershipPercentage < 50) {
      return {
        eligible: false,
        reason: `Собственикът притежава само ${company.ownershipPercentage}% дял в ${company.name}. Необходими са поне 50%.`,
        companyName: company.name,
        details: {
          companyType: company.type,
          ownershipPercentage: company.ownershipPercentage,
          registrationNumber: company.registrationNumber
        }
      };
    }

    // Criterion 3: Must not have existing Wallester account
    if (company.hasExistingWallesterAccount) {
      return {
        eligible: false,
        reason: `${company.name} вече има съществуващ Wallester акаунт`,
        companyName: company.name,
        details: {
          companyType: company.type,
          ownershipPercentage: company.ownershipPercentage,
          registrationNumber: company.registrationNumber,
          hasExistingAccount: true
        }
      };
    }

    // Criterion 4: Must not be blacklisted
    if (company.isBlacklisted) {
      return {
        eligible: false,
        reason: `${company.name} е в черен списък и не може да кандидатства за Wallester`,
        companyName: company.name,
        details: {
          companyType: company.type,
          ownershipPercentage: company.ownershipPercentage,
          registrationNumber: company.registrationNumber,
          isBlacklisted: true
        }
      };
    }

    // All criteria passed!
    return {
      eligible: true,
      reason: `${company.name} отговаря на всички критерии за Wallester карта!`,
      companyName: company.name,
      details: {
        companyType: company.type,
        ownershipPercentage: company.ownershipPercentage,
        registrationNumber: company.registrationNumber,
        registrationDate: company.registrationDate,
        allCriteriaMet: true
      }
    };
  }

  // If we get here, no eligible companies were found
  return {
    eligible: false,
    reason: 'Не са намерени ООД или ЕООД фирми, регистрирани на това име',
    details: {
      companiesFound: companyData.companies.length,
      companyTypes: companyData.companies.map(c => c.type).join(', ')
    }
  };
}

export { router as wallesterRouter };
