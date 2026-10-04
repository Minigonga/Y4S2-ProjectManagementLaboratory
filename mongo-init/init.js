db = db.getSiblingDB('database');

db.companies.deleteMany({});
db.teams.deleteMany({});
db.sessions.deleteMany({});
db.enrollments.deleteMany({});
db.users.deleteMany({});
db.career_paths.deleteMany({});
db.courses.deleteMany({});
db.jobs.deleteMany({});
db.reviews.deleteMany({});

var trainUCompanyId = ObjectId();
var partnerCompanyId = ObjectId();

var users = {
  adminAna: ObjectId(),
  adminDuarte: ObjectId(),
  mgrMarta: ObjectId(),
  mgrSergio: ObjectId(),
  mgrInes: ObjectId(),
  mgrPaulo: ObjectId(),
  mgrMario: ObjectId(),
  empJoao: ObjectId(),
  empRita: ObjectId(),
  empLuis: ObjectId(),
  empSofia: ObjectId(),
  empMiguel: ObjectId(),
  empEva: ObjectId(),
  empTomas: ObjectId(),
  empCarla: ObjectId(),
  empBruno: ObjectId(),
  empMafalda: ObjectId(),
  empNuno: ObjectId(),
  empHelena: ObjectId(),
  empTiago: ObjectId(),
  empLea: ObjectId(),
  empBianca: ObjectId(),
  empAndre: ObjectId(),
  empPatricia: ObjectId(),
  empGoncalo: ObjectId(),
  empRaquel: ObjectId(),
  empVasco: ObjectId(),
  empTeresa: ObjectId(),
  empDiogo: ObjectId(),
  empLuis2: ObjectId(),
  empNuno2: ObjectId(),
  empDiogo2: ObjectId(),
  empMiguel2: ObjectId(),
  empRaquel2: ObjectId(),
  empVasco2: ObjectId(),
  empCarla2: ObjectId(),
  empPatricia2: ObjectId(),
  empTeresa2: ObjectId(),
  empClara: ObjectId()
};

var teams = {
  engineering: ObjectId(),
  peopleOps: ObjectId(),
  dataAi: ObjectId(),
  salesEnablement: ObjectId(),
  partnerSupport: ObjectId(),
  platformOps: ObjectId(),
  talentAcquisition: ObjectId(),
  aiAutomation: ObjectId()
};

var courses = {
  workplaceSecurity: ObjectId(),
  cybersecurity101: ObjectId(),
  complianceCrisis: ObjectId(),
  communicationMastery: ObjectId(),
  aiForTeams: ObjectId(),
  onboardingFastTrack: ObjectId(),
  advancedCloudArchitecture: ObjectId(),
  antiBriberyAndCorruption: ObjectId(),
  executiveLeadershipStrategy: ObjectId(),
  introductionToAgileMethodology: ObjectId(),
  gdprDataPrivacyStandards: ObjectId(),
  maConfidentialProcedures: ObjectId(),
  healthAndSafetyBasics: ObjectId(),
  pythonForDataAnalysis: ObjectId(),
  implicitBiasAwareness: ObjectId(),
  blockchainInSupplyChain: ObjectId(),
  conflictResolutionForManagers: ObjectId(),
  annualItSecurityRefresh: ObjectId(),
  machineLearningFundamentals: ObjectId(),
  publicSpeakingForTechies: ObjectId(),
  financialInsiderTradingPolicy: ObjectId(),
  uxUiDesignSystems: ObjectId(),
  effectiveTimeManagement: ObjectId(),
  corporateEthicsIntegrity: ObjectId(),
  advancedReactPatterns: ObjectId(),
  emotionalIntelligenceAtWork: ObjectId(),
  whistleblowerTraining: ObjectId(),
  highPerformanceComputing: ObjectId(),
  customerSupportExcellence: ObjectId(),
  sexualHarassmentPrevention: ObjectId(),
  kubernetesForOperators: ObjectId(),
  negotiationSkillsForSales: ObjectId(),
  environmentalSustainability: ObjectId(),
  deepLearningWithPyTorch: ObjectId(),
  businessTravelPolicy: ObjectId(),
  mentorshipProgramKickoff: ObjectId(),
  cyberResilienceStrategy: ObjectId(),
  diversityInTheWorkplace: ObjectId(),
  effectiveRemoteWork: ObjectId(),
  sqlAdvancedQuerying: ObjectId(),
  workplaceViolenceAwareness: ObjectId(),
  enterpriseSeoBasics: ObjectId(),
  strategicThinkingForVPs: ObjectId(),
  itServiceManagementItil: ObjectId(),
  naturalLanguageProcessing: ObjectId(),
  activeListenerTraining: ObjectId(),
  globalExportControls: ObjectId(),
  microservicesWithGo: ObjectId(),
  marketingAnalyticsRoi: ObjectId(),
  onboardingForNewManagers: ObjectId(),
  legalPatentFiling101: ObjectId(),
  cloudSecurityBestPractices: ObjectId(),
  fireSafetyAndPrevention: ObjectId(),
  terraformInfrastructureAsCode: ObjectId(),
  agileProductManagement: ObjectId(),
  workplaceWellness: ObjectId(),
  devSecOpsIntegration: ObjectId(),
  changeManagementFrameworks: ObjectId(),
  hipaaDataCompliance: ObjectId(),
  quantumComputingIntro: ObjectId(),
  scrumMasterCertification: ObjectId(),
  employeeRightsLaborLaws: ObjectId(),
  kubernetesAdvancedNetworking: ObjectId(),
  customerFeedbackLoop: ObjectId(),
  annualPolicyReview2026: ObjectId(),
  rustForSystemsProgramming: ObjectId(),
  publicSpeakingKeynotes: ObjectId(),
  antiHarassmentTraining: ObjectId(),
  executivePresentingSkills: ObjectId(),
  graphqlApiDesign: ObjectId(),
  corporateTaxLaws: ObjectId(),
  zeroTrustSecurityArchitect: ObjectId(),
  storytellingForSales: ObjectId(),
  hazardousMaterialsHandling: ObjectId(),
  aiModelFineTuning: ObjectId(),
  projectManagementFoundations: ObjectId(),
  dataPrivacyForEngineers: ObjectId(),
  searchEngineAlgorithms: ObjectId(),
  personalFinanceForEmployees: ObjectId(),
  insiderThreatMitigation: ObjectId(),
  fpgaProgramming: ObjectId(),
  leadership360Feedback: ObjectId(),
  ethicalHackingIntro: ObjectId(),
  brandGuidelines2026: ObjectId(),
  bigDataWithSpark: ObjectId(),
  influencingWithoutAuthority: ObjectId(),
  workplaceSafetyForRemoteWorkers: ObjectId(),
  advancedCryptography: ObjectId(),
  contentMarketingStrategy: ObjectId(),
  equalOpportunityEmployment: ObjectId(),
  webAssemblyWasmIntro: ObjectId(),
  customerSuccessFoundations: ObjectId(),
  cyberEspionageDefense: ObjectId(),
  unconsciousBiasInPerformanceReviews: ObjectId(),
  siteReliabilityEngineering: ObjectId(),
  mobileAppAccessibility: ObjectId(),
  socialMediaPolicy: ObjectId()
};

var careerPaths = {
  engineeringPath: ObjectId(),
  peopleOpsPath: ObjectId(),
  dataAiPath: ObjectId(),
  productPath: ObjectId()
};

var jobs = {
  seniorSoftwareEngineer: ObjectId(),
  productManager: ObjectId(),
  devOpsSpecialist: ObjectId(),
  dataAnalyst: ObjectId(),
  peopleOpsManager: ObjectId(),
  qaAutomationEngineer: ObjectId(),
  securityAnalyst: ObjectId()
};

var sessions = {
  session1: ObjectId(),
  session2: ObjectId(),
  session3: ObjectId(),
  session4: ObjectId(),
  session5: ObjectId(),
  session6: ObjectId(),
  session7: ObjectId(),
  session8: ObjectId(),
  session9: ObjectId(),
  session10: ObjectId(),
  session11: ObjectId(),
  session12: ObjectId(),
  session13: ObjectId(),
  session14: ObjectId(),
  session15: ObjectId(),
  session16: ObjectId(),
  session17: ObjectId(),
  session18: ObjectId(),
  session19: ObjectId(),
  session20: ObjectId(),
  session21: ObjectId(),
  session22: ObjectId(),
  session23: ObjectId(),
  session24: ObjectId(),
  session25: ObjectId(),
  session26: ObjectId(),
  session27: ObjectId(),
  session28: ObjectId(),
  session29: ObjectId(),
  session30: ObjectId(),
  session31: ObjectId(),
  session32: ObjectId(),
  session33: ObjectId(),
  session34: ObjectId(),
  session35: ObjectId(),
  session36: ObjectId(),
  session37: ObjectId(),
  session38: ObjectId(),
  session39: ObjectId(),
  session40: ObjectId(),
  session41: ObjectId(),
  session42: ObjectId(),
  session43: ObjectId(),
  session44: ObjectId(),
  session45: ObjectId(),
  session46: ObjectId(),
  session47: ObjectId(),
  session48: ObjectId(),
  session49: ObjectId(),
  session50: ObjectId(),
  session51: ObjectId(),
  session52: ObjectId(),
  session53: ObjectId(),
  session54: ObjectId(),
  session55: ObjectId(),
  session56: ObjectId(),
  session57: ObjectId(),
  session58: ObjectId(),
  session59: ObjectId(),
  session60: ObjectId(),
  session61: ObjectId(),
  session62: ObjectId(),
  session63: ObjectId(),
  session64: ObjectId(),
  session65: ObjectId(),
  session66: ObjectId(),
  session67: ObjectId(),
  session68: ObjectId(),
  session69: ObjectId(),
  session70: ObjectId(),
  session71: ObjectId(),
  session72: ObjectId(),
  session73: ObjectId(),
  session74: ObjectId(),
  session75: ObjectId(),
  session76: ObjectId(),
  session77: ObjectId(),
  session78: ObjectId(),
  session79: ObjectId(),
  session80: ObjectId(),
  session81: ObjectId(),
  session82: ObjectId(),
  session83: ObjectId(),
  session84: ObjectId(),
  session85: ObjectId(),
  session86: ObjectId(),
  session87: ObjectId(),
  session88: ObjectId(),
  session89: ObjectId(),
  session90: ObjectId(),
  session91: ObjectId(),
  session92: ObjectId(),
  session93: ObjectId(),
  session94: ObjectId(),
  session95: ObjectId(),
  session96: ObjectId()
}

var enrollments = {
  enrollment1: ObjectId(),
  enrollment2: ObjectId(),
  enrollment3: ObjectId(),
  enrollment4: ObjectId(),
  enrollment5: ObjectId(),
  enrollment6: ObjectId(),
  enrollment7: ObjectId(),
  enrollment8: ObjectId(),
  enrollment9: ObjectId(),
  enrollment10: ObjectId(),
  enrollment11: ObjectId(),
  enrollment12: ObjectId(),
  enrollment13: ObjectId(),
  enrollment14: ObjectId(),
  enrollment15: ObjectId(),
  enrollment16: ObjectId(),
  enrollment17: ObjectId(),
  enrollment18: ObjectId(),
  enrollment19: ObjectId(),
  enrollment20: ObjectId(),
  enrollment21: ObjectId(),
  enrollment22: ObjectId(),
  enrollment23: ObjectId(),
  enrollment24: ObjectId(),
  enrollment25: ObjectId(),
  enrollment26: ObjectId(),
  enrollment27: ObjectId(),
  enrollment28: ObjectId(),
  enrollment29: ObjectId(),
  enrollment30: ObjectId(),
  enrollment31: ObjectId(),
  enrollment32: ObjectId(),
  enrollment33: ObjectId(),
  enrollment34: ObjectId(),
  enrollment35: ObjectId(),
  enrollment36: ObjectId(),
  enrollment37: ObjectId(),
  enrollment38: ObjectId(),
  enrollment39: ObjectId(),
  enrollment40: ObjectId(),
  enrollment41: ObjectId(),
  enrollment42: ObjectId(),
  enrollment43: ObjectId(),
  enrollment44: ObjectId(),
  enrollment45: ObjectId(),
  enrollment46: ObjectId(),
  enrollment47: ObjectId(),
  enrollment48: ObjectId(),
  enrollment49: ObjectId(),
  enrollment50: ObjectId(),
  enrollment51: ObjectId(),
  enrollment52: ObjectId(),
  enrollment53: ObjectId(),
  enrollment54: ObjectId(),
  enrollment55: ObjectId(),
  enrollment56: ObjectId(),
  enrollment57: ObjectId(),
  enrollment58: ObjectId(),
  enrollment59: ObjectId(),
  enrollment60: ObjectId(),
  enrollment61: ObjectId(),
  enrollment62: ObjectId(),
  enrollment63: ObjectId(),
  enrollment64: ObjectId(),
  enrollment65: ObjectId(),
  enrollment66: ObjectId(),
  enrollment67: ObjectId(),
  enrollment68: ObjectId(),
  enrollment69: ObjectId(),
  enrollment70: ObjectId(),
  enrollment71: ObjectId(),
  enrollment72: ObjectId(),
  enrollment73: ObjectId(),
  enrollment74: ObjectId(),
  enrollment75: ObjectId(),
  enrollment76: ObjectId(),
  enrollment77: ObjectId(),
  enrollment78: ObjectId(),
  enrollment79: ObjectId(),
  enrollment80: ObjectId(),
  enrollment81: ObjectId(),
  enrollment82: ObjectId(),
  enrollment83: ObjectId(),
  enrollment84: ObjectId(),
  enrollment85: ObjectId(),
  enrollment86: ObjectId(),
  enrollment87: ObjectId(),
  enrollment88: ObjectId(),
  enrollment89: ObjectId(),
  enrollment90: ObjectId(),
  enrollment91: ObjectId(),
  enrollment92: ObjectId(),
  enrollment93: ObjectId(),
  enrollment94: ObjectId(),
  enrollment95: ObjectId(),
  enrollment96: ObjectId()
};

db.companies.insertMany([
  { _id: trainUCompanyId, name: 'TrainU+' },
  { _id: partnerCompanyId, name: 'PartnerCo Labs' }
]);

db.career_paths.insertMany([
  {
    _id: careerPaths.engineeringPath,
    title: "Engineering Career Path",
    description: "A structured progression for software engineers, from junior to principal levels."
  },
  {
    _id: careerPaths.productPath,
    title: "Product Management Career Path",
    description: "A structured progression for product managers, from associate to VP levels."
  },
  {
    _id: careerPaths.peopleOpsPath,
    title: "People Operations Career Path",
    description: "A structured progression for HR professionals, from coordinator to director levels."
  }
]);

db.jobs.insertMany([
  { _id: jobs.seniorSoftwareEngineer, title: 'Senior Software Engineer', description: 'Responsible for designing, developing, and maintaining scalable web applications and distributed systems.' },
  { _id: jobs.productManager, title: 'Product Manager', description: 'Leads cross-functional teams to define product vision, strategy, and feature roadmaps based on market research.' },
  { _id: jobs.devOpsSpecialist, title: 'DevOps Specialist', description: 'Focuses on automating deployment pipelines, managing cloud infrastructure, and ensuring continuous system reliability.' },
  { _id: jobs.dataAnalyst, title: 'Data Analyst', description: 'Interprets complex datasets to extract actionable business insights, build dashboards, and track operational metrics.' },
  { _id: jobs.peopleOpsManager, title: 'People Operations Manager', description: 'Oversees talent acquisition, employee development programs, internal compliance, and workplace culture initiatives.' },
  { _id: jobs.qaAutomationEngineer, title: 'QA Automation Engineer', description: 'Designs and executes automated test suites to ensure the quality, performance, and stability of software releases.' },
  { _id: jobs.securityAnalyst, title: 'Security Analyst', description: 'Monitors corporate networks for security threats, implements protective guardrails, and enforces compliance audits.' }
]);

db.users.insertMany([
  { _id: users.adminAna, name: 'Ana Silva', email: 'ana.silva@trainuplus.com', company_id: trainUCompanyId, role: 'admin', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, linkedIn_url: 'https://www.linkedin.com/in/ana-silva-trainuplus', interested_courses: [courses.advancedCloudArchitecture, courses.aiModelFineTuning] },
  { _id: users.adminDuarte, name: 'Duarte Costa', email: 'duarte.costa@trainuplus.com', company_id: trainUCompanyId, role: 'admin', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.securityAnalyst, linkedIn_url: 'https://www.linkedin.com/in/duarte-costa-trainuplus', interested_courses: [courses.cybersecurity101, courses.zeroTrustSecurityArchitect] },
  { _id: users.mgrMarta, name: 'Marta Gomes', email: 'marta.gomes@trainuplus.com', company_id: trainUCompanyId, role: 'manager', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.productManager, linkedIn_url: 'https://www.linkedin.com/in/marta-gomes-product', interested_courses: [courses.agileProductManagement, courses.aiForTeams] },
  { _id: users.mgrSergio, name: 'Sergio Nunes', email: 'sergio.nunes@trainuplus.com', company_id: trainUCompanyId, role: 'manager', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.devOpsSpecialist, linkedIn_url: 'https://www.linkedin.com/in/sergio-nunes-devops', interested_courses: [courses.kubernetesForOperators, courses.terraformInfrastructureAsCode] },
  { _id: users.mgrInes, name: 'Ines Afonso', email: 'ines.afonso@trainuplus.com', company_id: trainUCompanyId, role: 'manager', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.productManager, linkedIn_url: 'https://www.linkedin.com/in/ines-afonso-strategy', interested_courses: [courses.agileProductManagement, courses.changeManagementFrameworks] },
  { _id: users.mgrPaulo, name: 'Paulo Neves', email: 'paulo.neves@trainuplus.com', company_id: trainUCompanyId, role: 'manager', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, linkedIn_url: 'https://www.linkedin.com/in/paulo-neves-leadership', interested_courses: [courses.conflictResolutionForManagers, courses.executivePresentingSkills] },
  { _id: users.mgrMario, name: 'Mario Vidal', email: 'mario.vidal@partnercolabs.com', company_id: partnerCompanyId, role: 'manager', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, linkedIn_url: 'https://www.linkedin.com/in/mario-vidal-partner', interested_courses: [courses.advancedReactPatterns, courses.leadership360Feedback] },
  { _id: users.empJoao, name: 'Joao Almeida', email: 'joao.almeida@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, linkedIn_url: 'https://www.linkedin.com/in/joao-almeida-engineering', interested_courses: [courses.advancedReactPatterns, courses.graphqlApiDesign] },
  { _id: users.empRita, name: 'Rita Ribeiro', email: 'rita.ribeiro@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.qaAutomationEngineer, linkedIn_url: 'https://www.linkedin.com/in/rita-ribeiro-qa', interested_courses: [courses.introductionToAgileMethodology, courses.cybersecurity101] },
  { _id: users.empLuis, name: 'Luis Matos', email: 'luis.matos@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, linkedIn_url: 'https://www.linkedin.com/in/luis-matos-systems', interested_courses: [courses.rustForSystemsProgramming, courses.microservicesWithGo] },
  { _id: users.empSofia, name: 'Sofia Pires', email: 'sofia.pires@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.dataAnalyst, linkedIn_url: 'https://www.linkedin.com/in/sofia-pires-data', interested_courses: [courses.pythonForDataAnalysis, courses.sqlAdvancedQuerying] },
  { _id: users.empMiguel, name: 'Miguel Cardoso', email: 'miguel.cardoso@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.qaAutomationEngineer, interested_courses: [courses.introductionToAgileMethodology] },
  { _id: users.empEva, name: 'Eva Tavares', email: 'eva.tavares@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.dataAnalyst, interested_courses: [courses.machineLearningFundamentals, courses.bigDataWithSpark] },
  { _id: users.empTomas, name: 'Tomas Faria', email: 'tomas.faria@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.devOpsSpecialist, interested_courses: [courses.kubernetesAdvancedNetworking, courses.siteReliabilityEngineering] },
  { _id: users.empCarla, name: 'Carla Mendes', email: 'carla.mendes@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.seniorSoftwareEngineer, interested_courses: [courses.webAssemblyWasmIntro, courses.highPerformanceComputing] },
  { _id: users.empBruno, name: 'Bruno Freitas', email: 'bruno.freitas@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.implicitBiasAwareness, courses.equalOpportunityEmployment] },
  { _id: users.empMafalda, name: 'Mafalda Rocha', email: 'mafalda.rocha@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.unconsciousBiasInPerformanceReviews, courses.employeeRightsLaborLaws] },
  { _id: users.empNuno, name: 'Nuno Esteves', email: 'nuno.esteves@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.communicationMastery] },
  { _id: users.empHelena, name: 'Helena Sousa', email: 'helena.sousa@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.emotionalIntelligenceAtWork, courses.workplaceWellness] },
  { _id: users.empTiago, name: 'Tiago Matias', email: 'tiago.matias@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.implicitBiasAwareness] },
  { _id: users.empLea, name: 'Lea Fonseca', email: 'lea.fonseca@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.diversityInTheWorkplace] },
  { _id: users.empBianca, name: 'Bianca Mota', email: 'bianca.mota@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.communicationMastery, courses.activeListenerTraining] },
  { _id: users.empAndre, name: 'Andre Lopes', email: 'andre.lopes@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.equalOpportunityEmployment] },
  { _id: users.empPatricia, name: 'Patricia Vale', email: 'patricia.vale@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.onboardingForNewManagers] },
  { _id: users.empGoncalo, name: 'Goncalo Dias', email: 'goncalo.dias@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.employeeRightsLaborLaws] },
  { _id: users.empRaquel, name: 'Raquel Santos', email: 'raquel.santos@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.unconsciousBiasInPerformanceReviews] },
  { _id: users.empVasco, name: 'Vasco Coelho', email: 'vasco.coelho@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.diversityInTheWorkplace, courses.workplaceWellness] },
  { _id: users.empTeresa, name: 'Teresa Monteiro', email: 'teresa.monteiro@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.emotionalIntelligenceAtWork] },
  { _id: users.empDiogo, name: 'Diogo Pacheco', email: 'diogo.pacheco@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.onboardingForNewManagers, courses.activeListenerTraining] },
  { _id: users.empDiogo2, name: 'Diogo Pacheco2', email: 'diogo.pacheco2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [] },
  { _id: users.empMiguel2, name: 'Miguel Cardoso2', email: 'miguel.cardoso2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.communicationMastery] },
  { _id: users.empRaquel2, name: 'Raquel Santos2', email: 'raquel.santos2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.implicitBiasAwareness] },
  { _id: users.empVasco2, name: 'Vasco Coelho2', email: 'vasco.coelho2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.equalOpportunityEmployment] },
  { _id: users.empCarla2, name: 'Carla Mendes2', email: 'carla.mendes2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.unconsciousBiasInPerformanceReviews] },
  { _id: users.empPatricia2, name: 'Patricia Vale2', email: 'patricia.vale2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.diversityInTheWorkplace] },
  { _id: users.empTeresa2, name: 'Teresa Monteiro2', email: 'teresa.monteiro2@trainuplus.com', company_id: trainUCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.employeeRightsLaborLaws] },
  { _id: users.empClara, name: 'Clara Reis', email: 'clara.reis@partnercolabs.com', company_id: partnerCompanyId, role: 'employee', image_url: 'http://localhost:5000/static/user-images/default-avatar.svg', job_id: jobs.peopleOpsManager, interested_courses: [courses.onboardingForNewManagers, courses.communicationMastery] }
]);

db.users.updateMany(
  { interested_courses: { $exists: false } },
  { $set: { interested_courses: null } }
);

db.users.updateMany(
  { linkedIn_url: { $exists: false } },
  { $set: { linkedIn_url: '' } }
);

db.teams.insertMany([
  {
    _id: teams.engineering,
    name: 'Engineering Core',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrMarta,
    member_ids: [users.empJoao, users.empRita, users.empLuis, users.empSofia, users.empAndre, users.empDiogo]
  },
  {
    _id: teams.peopleOps,
    name: 'People Operations',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrSergio,
    member_ids: [users.empEva, users.empTomas, users.empCarla, users.empPatricia, users.empTeresa]
  },
  {
    _id: teams.dataAi,
    name: 'Data and AI',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrInes,
    member_ids: [users.empMiguel, users.empBruno, users.empMafalda, users.empNuno, users.empRaquel, users.empVasco]
  },
  {
    _id: teams.salesEnablement,
    name: 'Sales Enablement',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrPaulo,
    member_ids: [users.empHelena, users.empTiago, users.empLea, users.empBianca, users.empGoncalo]
  },
  {
    _id: teams.partnerSupport,
    name: 'Partner Support',
    company_id: partnerCompanyId,
    team_leader_id: users.mgrMario,
    member_ids: [users.empClara]
  },
  {
    _id: teams.platformOps,
    name: 'Platform Operations',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrMarta,
    member_ids: [users.empLuis2, users.empNuno2, users.empDiogo2]
  },
  {
    _id: teams.talentAcquisition,
    name: 'Talent Acquisition',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrSergio,
    member_ids: [users.empCarla2, users.empPatricia2, users.empTeresa2]
  },
  {
    _id: teams.aiAutomation,
    name: 'AI Automation Squad',
    company_id: trainUCompanyId,
    team_leader_id: users.mgrInes,
    member_ids: [users.empMiguel2, users.empRaquel2, users.empVasco2]
  }
]);

db.courses.insertMany([
  { _id: courses.workplaceSecurity, title: 'Workplace Security Workshop', description: 'Security fundamentals for modern workplaces, remote access, and team-safe practices.', duration_hours: 10, type: 'compliance', format: 'hybrid', capacity: 120, skill_tags: ['workplace-security', 'policy-awareness', 'risk-prevention'], created_by: users.adminAna },
  { _id: courses.cybersecurity101, title: 'Cybersecurity 101', description: 'Hands-on introduction to common threats, phishing defense, and secure engineering basics.', duration_hours: 20, type: 'technical', format: 'online', capacity: 140, skill_tags: ['cybersecurity', 'threat-detection', 'secure-coding'], created_by: users.adminDuarte },
  { _id: courses.complianceCrisis, title: 'Compliance & Crisis Response', description: 'Practical compliance workflows and response playbooks for high-pressure incidents.', duration_hours: 4, type: 'compliance', format: 'in_person', capacity: 80, skill_tags: ['compliance', 'incident-response', 'communication'], created_by: users.adminAna },
  { _id: courses.communicationMastery, title: 'Communication Mastery', description: 'Clear communication frameworks for team alignment, feedback, and conflict resolution.', duration_hours: 8, type: 'soft_skill', format: 'hybrid', capacity: 160, skill_tags: ['communication', 'feedback', 'collaboration'], created_by: users.adminDuarte },
  { _id: courses.aiForTeams, title: 'AI for Business Teams', description: 'Responsible AI usage and practical workflows for operations, product, and support teams.', duration_hours: 12, type: 'technical', format: 'online', capacity: 200, skill_tags: ['ai', 'productivity', 'prompting'], created_by: users.adminAna },
  { _id: courses.onboardingFastTrack, title: 'Onboarding Fast Track', description: 'Company onboarding with tools, culture, security baseline, and team practices.', duration_hours: 6, type: 'soft_skill', format: 'online', capacity: 250, skill_tags: ['onboarding', 'culture', 'workflow'], created_by: users.adminAna },
  { _id: courses.advancedCloudArchitecture, title: "Advanced Cloud Architecture", description: "Deep dive into AWS and Azure multi-region infrastructure setups.", duration_hours: 40, type: "technical", format: "online", capacity: 100, skill_tags: ["cloud", "aws", "azure", "architecture"], created_by: users.adminAna },
  { _id: courses.antiBriberyAndCorruption, title: "Anti-Bribery and Corruption", description: "Global standards for preventing unethical business practices.", duration_hours: 15, type: "compliance", format: "in_person", capacity: 50, skill_tags: ["compliance", "ethics", "legal"], created_by: users.adminAna },
  { _id: courses.executiveLeadershipStrategy, title: "Executive Leadership Strategy", description: "Developing vision and long-term roadmap planning for C-suite roles.", duration_hours: 120, type: "soft_skill", format: "in_person", capacity: 30, skill_tags: ["leadership", "strategy", "management"], created_by: users.adminDuarte },
  { _id: courses.introductionToAgileMethodology, title: "Introduction to Agile Methodology", description: "Learn the basics of Scrum, Kanban, and iterative development.", duration_hours: 30, type: "soft_skill", format: "online", capacity: 150, skill_tags: ["agile", "scrum", "kanban"], created_by: users.adminDuarte },
  { _id: courses.gdprDataPrivacyStandards, title: "GDPR Data Privacy Standards", description: "Essential compliance training for handling European citizen data.", duration_hours: 25, type: "compliance", format: "hybrid", capacity: 100, skill_tags: ["gdpr", "privacy", "compliance"], created_by: users.adminAna },
  { _id: courses.maConfidentialProcedures, title: "M&A Confidential Procedures", description: "Protocols for handling sensitive Mergers and Acquisitions data.", duration_hours: 50, type: "soft_skill", format: "in_person", capacity: 40, skill_tags: ["ma", "legal", "confidentiality"], created_by: users.adminAna },
  { _id: courses.healthAndSafetyBasics, title: "Health and Safety Basics", description: "Standard OSHA compliance and workplace safety rules.", duration_hours: 10, type: "compliance", format: "online", capacity: 200, skill_tags: ["safety", "osha", "compliance"], created_by: users.adminAna },
  { _id: courses.pythonForDataAnalysis, title: "Python for Data Analysis", description: "Using Pandas and NumPy to process large enterprise datasets.", duration_hours: 35, type: "technical", format: "online", capacity: 120, skill_tags: ["python", "data-analysis", "pandas", "numpy"], created_by: users.adminDuarte },
  { _id: courses.implicitBiasAwareness, title: "Implicit Bias Awareness", description: "Identifying and mitigating unconscious bias in the hiring process.", duration_hours: 8, type: "soft_skill", format: "hybrid", capacity: 80, skill_tags: ["bias-awareness", "hr", "inclusion"], created_by: users.adminAna },
  { _id: courses.blockchainInSupplyChain, title: "Blockchain in Supply Chain", description: "How to utilize distributed ledgers for tracking global inventory.", duration_hours: 45, type: "technical", format: "online", capacity: 100, skill_tags: ["blockchain", "supply-chain", "ledger"], created_by: users.adminDuarte },
  { _id: courses.conflictResolutionForManagers, title: "Conflict Resolution for Managers", description: "Techniques for mediating disputes and maintaining team morale.", duration_hours: 18, type: "soft_skill", format: "in_person", capacity: 50, skill_tags: ["conflict-resolution", "management", "communication"], created_by: users.adminAna },
  { _id: courses.annualItSecurityRefresh, title: "Annual IT Security Refresh", description: "Mandatory yearly update on the latest digital threat landscape.", duration_hours: 5, type: "compliance", format: "in_person", capacity: 300, skill_tags: ["security", "it", "compliance"], created_by: users.adminDuarte },
  { _id: courses.machineLearningFundamentals, title: "Machine Learning Fundamentals", description: "A primer on supervised and unsupervised learning algorithms.", duration_hours: 50, type: "technical", format: "online", capacity: 150, skill_tags: ["machine-learning", "ai", "data-science"], created_by: users.adminAna },
  { _id: courses.publicSpeakingForTechies, title: "Public Speaking for Techies", description: "Helping engineers present complex ideas to non-technical stakeholders.", duration_hours: 12, type: "soft_skill", format: "hybrid", capacity: 60, skill_tags: ["public-speaking", "presentation", "communication"], created_by: users.adminDuarte },
  { _id: courses.financialInsiderTradingPolicy, title: "Financial Insider Trading Policy", description: "Legal constraints regarding trading company stock and handling info.", duration_hours: 6, type: "compliance", format: "in_person", capacity: 100, skill_tags: ["finance", "legal", "compliance"], created_by: users.adminAna },
  { _id: courses.uxUiDesignSystems, title: "UX/UI Design Systems", description: "Maintaining consistency using Figma-based enterprise design libraries.", duration_hours: 22, type: "soft_skill", format: "online", capacity: 120, skill_tags: ["ux", "ui", "figma", "design-system"], created_by: users.adminDuarte },
  { _id: courses.effectiveTimeManagement, title: "Effective Time Management", description: "Productivity frameworks for high-performing individual contributors.", duration_hours: 10, type: "soft_skill", format: "in_person", capacity: 80, skill_tags: ["productivity", "time-management"], created_by: users.adminDuarte },
  { _id: courses.corporateEthicsIntegrity, title: "Corporate Ethics & Integrity", description: "Navigating ethical dilemmas in complex business environments.", duration_hours: 12, type: "compliance", format: "hybrid", capacity: 150, skill_tags: ["ethics", "integrity", "compliance"], created_by: users.adminAna },
  { _id: courses.advancedReactPatterns, title: "Advanced React Patterns", description: "Optimizing high-traffic dashboards using Hooks and Suspense.", duration_hours: 25, type: "technical", format: "online", capacity: 100, skill_tags: ["react", "javascript", "frontend"], created_by: users.adminDuarte },
  { _id: courses.emotionalIntelligenceAtWork, title: "Emotional Intelligence at Work", description: "Building stronger relationships through empathy and self-awareness.", duration_hours: 15, type: "soft_skill", format: "in_person", capacity: 45, skill_tags: ["emotional-intelligence", "empathy", "communication"], created_by: users.adminAna },
  { _id: courses.whistleblowerTraining, title: "Whistleblower Training", description: "Understanding the channels and protections for reporting misconduct.", duration_hours: 5, type: "compliance", format: "in_person", capacity: 200, skill_tags: ["compliance", "legal", "whistleblower"], created_by: users.adminAna },
  { _id: courses.highPerformanceComputing, title: "High-Performance Computing", description: "Introduction to GPU acceleration and parallel processing.", duration_hours: 40, type: "technical", format: "online", capacity: 80, skill_tags: ["hpc", "gpu", "parallel-processing"], created_by: users.adminDuarte },
  { _id: courses.customerSupportExcellence, title: "Customer Support Excellence", description: "Best practices for handling escalated client complaints.", duration_hours: 20, type: "soft_skill", format: "in_person", capacity: 60, skill_tags: ["customer-support", "communication"], created_by: users.adminDuarte },
  { _id: courses.sexualHarassmentPrevention, title: "Sexual Harassment Prevention", description: "Legal requirements for maintaining a safe and respectful workplace.", duration_hours: 10, type: "compliance", format: "hybrid", capacity: 500, skill_tags: ["compliance", "safety", "legal"], created_by: users.adminAna },
  { _id: courses.kubernetesForOperators, title: "Kubernetes for Operators", description: "Scaling and managing containerized applications at scale.", duration_hours: 35, type: "technical", format: "online", capacity: 100, skill_tags: ["kubernetes", "devops", "containers"], created_by: users.adminDuarte },
  { _id: courses.negotiationSkillsForSales, title: "Negotiation Skills for Sales", description: "How to close complex deals while maintaining healthy margins.", duration_hours: 24, type: "soft_skill", format: "in_person", capacity: 40, skill_tags: ["sales", "negotiation", "business"], created_by: users.adminDuarte },
  { _id: courses.environmentalSustainability, title: "Environmental Sustainability", description: "Our corporate commitment to reducing our carbon footprint.", duration_hours: 4, type: "compliance", format: "in_person", capacity: 150, skill_tags: ["sustainability", "green", "compliance"], created_by: users.adminAna },
  { _id: courses.deepLearningWithPyTorch, title: "Deep Learning with PyTorch", description: "Neural networks, backpropagation, and vision transformers.", duration_hours: 60, type: "technical", format: "online", capacity: 120, skill_tags: ["pytorch", "deep-learning", "ai"], created_by: users.adminAna },
  { _id: courses.businessTravelPolicy, title: "Business Travel Policy", description: "Guidelines for booking, expenses, and international safety.", duration_hours: 3, type: "soft_skill", format: "hybrid", capacity: 250, skill_tags: ["policy", "travel", "finance"], created_by: users.adminAna },
  { _id: courses.mentorshipProgramKickoff, title: "Mentorship Program Kickoff", description: "Defining the role of mentors and mentees in the organization.", duration_hours: 6, type: "soft_skill", format: "in_person", capacity: 80, skill_tags: ["mentorship", "culture", "growth"], created_by: users.adminDuarte },
  { _id: courses.cyberResilienceStrategy, title: "Cyber Resilience Strategy", description: "Planning for business continuity after a major security breach.", duration_hours: 30, type: "soft_skill", format: "online", capacity: 100, skill_tags: ["cybersecurity", "resilience", "strategy"], created_by: users.adminDuarte },
  { _id: courses.diversityInTheWorkplace, title: "Diversity in the Workplace", description: "Celebrating differences and building inclusive team cultures.", duration_hours: 10, type: "soft_skill", format: "hybrid", capacity: 200, skill_tags: ["diversity", "inclusion", "culture"], created_by: users.adminAna },
  { _id: courses.effectiveRemoteWork, title: "Effective Remote Work", description: "Tools and habits for staying productively outside the office.", duration_hours: 8, type: "soft_skill", format: "in_person", capacity: 150, skill_tags: ["remote", "productivity", "workflows"], created_by: users.adminDuarte },
  { _id: courses.sqlAdvancedQuerying, title: "SQL Advanced Querying", description: "Window functions, CTEs, and query optimization for analysts.", duration_hours: 15, type: "technical", format: "online", capacity: 130, skill_tags: ["sql", "database", "analytics"], created_by: users.adminDuarte },
  { _id: courses.workplaceViolenceAwareness, title: "Workplace Violence Awareness", description: "Recognizing early warning signs and reporting procedures.", duration_hours: 5, type: "compliance", format: "hybrid", capacity: 400, skill_tags: ["safety", "compliance", "reporting"], created_by: users.adminAna },
  { _id: courses.enterpriseSeoBasics, title: "Enterprise SEO Basics", description: "How to manage search visibility for large-scale web properties.", duration_hours: 12, type: "soft_skill", format: "online", capacity: 90, skill_tags: ["seo", "marketing", "search"], created_by: users.adminDuarte },
  { _id: courses.strategicThinkingForVPs, title: "Strategic Thinking for VPs", description: "Allocating resources and planning for a 5-year market shift.", duration_hours: 45, type: "soft_skill", format: "in_person", capacity: 25, skill_tags: ["strategy", "executive", "planning"], created_by: users.adminAna },
  { _id: courses.itServiceManagementItil, title: "IT Service Management (ITIL)", description: "Best practices for delivering high-quality IT support services.", duration_hours: 30, type: "soft_skill", format: "online", capacity: 100, skill_tags: ["itil", "it", "service-management"], created_by: users.adminDuarte },
  { _id: courses.naturalLanguageProcessing, title: "Natural Language Processing", description: "Building LLM-powered internal tools for document search.", duration_hours: 40, type: "technical", format: "in_person", capacity: 50, skill_tags: ["nlp", "llm", "ai"], created_by: users.adminAna },
  { _id: courses.activeListenerTraining, title: "Active Listener Training", description: "Improving communication by truly hearing and reflecting back.", duration_hours: 6, type: "soft_skill", format: "in_person", capacity: 40, skill_tags: ["communication", "listening", "soft-skills"], created_by: users.adminDuarte },
  { _id: courses.globalExportControls, title: "Global Export Controls", description: "Navigating trade sanctions and dual-use technology laws.", duration_hours: 20, type: "compliance", format: "in_person", capacity: 60, skill_tags: ["compliance", "legal", "global-trade"], created_by: users.adminAna },
  { _id: courses.microservicesWithGo, title: "Microservices with Go", description: "High-performance backend development with the Go language.", duration_hours: 28, type: "technical", format: "online", capacity: 100, skill_tags: ["go", "golang", "microservices", "backend"], created_by: users.adminDuarte },
  { _id: courses.marketingAnalyticsRoi, title: "Marketing Analytics ROI", description: "Measuring the true impact of multi-channel marketing campaigns.", duration_hours: 15, type: "soft_skill", format: "in_person", capacity: 50, skill_tags: ["marketing", "analytics", "roi"], created_by: users.adminDuarte },
  { _id: courses.onboardingForNewManagers, title: "Onboarding for New Managers", description: "Essential policies and HR workflows for managing employees.", duration_hours: 40, type: "soft_skill", format: "hybrid", capacity: 60, skill_tags: ["onboarding", "management", "hr"], created_by: users.adminAna },
  { _id: courses.legalPatentFiling101, title: "Legal Patent Filing 101", description: "How to document and submit novel inventions for patenting.", duration_hours: 12, type: "soft_skill", format: "hybrid", capacity: 40, skill_tags: ["legal", "patent", "intellectual-property"], created_by: users.adminAna },
  { _id: courses.cloudSecurityBestPractices, title: "Cloud Security Best Practices", description: "Hardening identity access and storage in the public cloud.", duration_hours: 20, type: "compliance", format: "online", capacity: 150, skill_tags: ["cloud", "security", "compliance"], created_by: users.adminAna },
  { _id: courses.fireSafetyAndPrevention, title: "Fire Safety and Prevention", description: "Mandatory drill and extinguisher usage demonstration.", duration_hours: 2, type: "compliance", format: "hybrid", capacity: 500, skill_tags: ["safety", "fire-safety", "compliance"], created_by: users.adminAna },
  { _id: courses.terraformInfrastructureAsCode, title: "Terraform Infrastructure as Code", description: "Managing cloud resources using declarative configuration.", duration_hours: 30, type: "technical", format: "online", capacity: 100, skill_tags: ["terraform", "iac", "devops"], created_by: users.adminDuarte },
  { _id: courses.agileProductManagement, title: "Agile Product Management", description: "From backlog grooming to successful sprint delivery.", duration_hours: 22, type: "soft_skill", format: "in_person", capacity: 60, skill_tags: ["product-management", "agile", "scrum"], created_by: users.adminDuarte },
  { _id: courses.workplaceWellness, title: "Workplace Wellness", description: "Ergonomics and mental health resources for employees.", duration_hours: 4, type: "soft_skill", format: "hybrid", capacity: 300, skill_tags: ["wellness", "ergonomics", "mental-health"], created_by: users.adminAna },
  { _id: courses.devSecOpsIntegration, title: "DevSecOps Integration", description: "Shifting security left in the software development lifecycle.", duration_hours: 35, type: "technical", format: "in_person", capacity: 60, skill_tags: ["devsecops", "devops", "security"], created_by: users.adminAna },
  { _id: courses.changeManagementFrameworks, title: "Change Management Frameworks", description: "Guiding large teams through organizational shifts.", duration_hours: 18, type: "soft_skill", format: "hybrid", capacity: 80, skill_tags: ["change-management", "leadership"], created_by: users.adminDuarte },
  { _id: courses.hipaaDataCompliance, title: "HIPAA Data Compliance", description: "Handling Protected Health Information (PHI) securely.", duration_hours: 15, type: "compliance", format: "online", capacity: 150, skill_tags: ["hipaa", "privacy", "compliance", "medical-data"], created_by: users.adminAna },
  { _id: courses.quantumComputingIntro, title: "Quantum Computing Intro", description: "Understanding qubits and potential business applications.", duration_hours: 50, type: "technical", format: "online", capacity: 100, skill_tags: ["quantum", "computing", "innovation"], created_by: users.adminDuarte },
  { _id: courses.scrumMasterCertification, title: "Scrum Master Certification", description: "Preparation for the internal Scrum Master exam.", duration_hours: 40, type: "soft_skill", format: "in_person", capacity: 40, skill_tags: ["scrum", "agile", "certification"], created_by: users.adminDuarte },
  { _id: courses.employeeRightsLaborLaws, title: "Employee Rights & Labor Laws", description: "Understanding regional labor protections and company duties.", duration_hours: 12, type: "compliance", format: "in_person", capacity: 80, skill_tags: ["legal", "labor-laws", "compliance"], created_by: users.adminAna },
  { _id: courses.kubernetesAdvancedNetworking, title: "Kubernetes Advanced Networking", description: "Service Mesh, CNI, and Ingress Controller tuning.", duration_hours: 45, type: "technical", format: "online", capacity: 70, skill_tags: ["kubernetes", "networking", "devops"], created_by: users.adminDuarte },
  { _id: courses.customerFeedbackLoop, title: "Customer Feedback Loop", description: "Translating support tickets into product features.", duration_hours: 10, type: "soft_skill", format: "in_person", capacity: 60, skill_tags: ["product", "feedback", "customer-success"], created_by: users.adminDuarte },
  { _id: courses.annualPolicyReview2026, title: "Annual Policy Review 2026", description: "Signing off on the updated employee handbook.", duration_hours: 2, type: "soft_skill", format: "hybrid", capacity: 500, skill_tags: ["policy", "handbook", "corporate"], created_by: users.adminAna },
  { _id: courses.rustForSystemsProgramming, title: "Rust for Systems Programming", description: "Safe and concurrent low-level coding.", duration_hours: 60, type: "technical", format: "online", capacity: 90, skill_tags: ["rust", "systems", "programming"], created_by: users.adminAna },
  { _id: courses.publicSpeakingKeynotes, title: "Public Speaking: Keynotes", description: "Preparing for major conference presentations.", duration_hours: 15, type: "soft_skill", format: "in_person", capacity: 30, skill_tags: ["keynote", "public-speaking", "communication"], created_by: users.adminDuarte },
  { _id: courses.antiHarassmentTraining, title: "Anti-Harassment Training", description: "Updated guidelines for workplace conduct.", duration_hours: 8, type: "compliance", format: "hybrid", capacity: 500, skill_tags: ["compliance", "conduct", "legal"], created_by: users.adminAna },
  { _id: courses.executivePresentingSkills, title: "Executive Presenting Skills", description: "Presenting data to board members and investors.", duration_hours: 20, type: "soft_skill", format: "in_person", capacity: 25, skill_tags: ["executive", "presentation", "communication"], created_by: users.adminDuarte },
  { _id: courses.graphqlApiDesign, title: "GraphQL API Design", description: "Building flexible and efficient internal APIs.", duration_hours: 24, type: "technical", format: "online", capacity: 110, skill_tags: ["graphql", "api", "backend"], created_by: users.adminDuarte },
  { _id: courses.corporateTaxLaws, title: "Corporate Tax Laws", description: "Essential updates for the global finance team.", duration_hours: 30, type: "compliance", format: "in_person", capacity: 40, skill_tags: ["tax-law", "finance", "compliance"], created_by: users.adminAna },
  { _id: courses.zeroTrustSecurityArchitect, title: "Zero Trust Security Architect", description: "Designing networks without a traditional perimeter.", duration_hours: 40, type: "technical", format: "hybrid", capacity: 75, skill_tags: ["zero-trust", "security", "network"], created_by: users.adminAna },
  { _id: courses.storytellingForSales, title: "Storytelling for Sales", description: "Using narrative to connect with potential clients.", duration_hours: 12, type: "soft_skill", format: "in_person", capacity: 50, skill_tags: ["sales", "storytelling", "communication"], created_by: users.adminDuarte },
  { _id: courses.hazardousMaterialsHandling, title: "Hazardous Materials Handling", description: "Safety protocols for R&D lab environments.", duration_hours: 18, type: "compliance", format: "in_person", capacity: 35, skill_tags: ["safety", "hazmat", "compliance"], created_by: users.adminAna },
  { _id: courses.aiModelFineTuning, title: "AI Model Fine-Tuning", description: "Adapting open-source models for specific company tasks.", duration_hours: 45, type: "technical", format: "hybrid", capacity: 80, skill_tags: ["ai", "fine-tuning", "llm"], created_by: users.adminAna },
  { _id: courses.projectManagementFoundations, title: "Project Management Foundations", description: "Introduction to waterfall and hybrid methods.", duration_hours: 20, type: "soft_skill", format: "online", capacity: 150, skill_tags: ["project-management", "waterfall", "hybrid"], created_by: users.adminDuarte },
  { _id: courses.dataPrivacyForEngineers, title: "Data Privacy for Engineers", description: "Building GDPR-compliant database schemas.", duration_hours: 14, type: "compliance", format: "in_person", capacity: 80, skill_tags: ["privacy", "gdpr", "database", "security"], created_by: users.adminAna },
  { _id: courses.searchEngineAlgorithms, title: "Search Engine Algorithms", description: "Deep dive into internal indexing technologies.", duration_hours: 35, type: "technical", format: "in_person", capacity: 60, skill_tags: ["search-engine", "algorithms", "indexing"], created_by: users.adminAna },
  { _id: courses.personalFinanceForEmployees, title: "Personal Finance for Employees", description: "Understanding 401k plans and company benefits.", duration_hours: 5, type: "soft_skill", format: "in_person", capacity: 200, skill_tags: ["finance", "401k", "benefits"], created_by: users.adminDuarte },
  { _id: courses.insiderThreatMitigation, title: "Insider Threat Mitigation", description: "Identifying risks from within the organization.", duration_hours: 10, type: "compliance", format: "hybrid", capacity: 120, skill_tags: ["insider-threat", "security", "compliance"], created_by: users.adminAna },
  { _id: courses.fpgaProgramming, title: "FPGA Programming", description: "Designing hardware-accelerated algorithms.", duration_hours: 80, type: "technical", format: "online", capacity: 50, skill_tags: ["fpga", "hardware", "programming"], created_by: users.adminAna },
  { _id: courses.leadership360Feedback, title: "Leadership 360 Feedback", description: "Analyzing peer and direct report feedback.", duration_hours: 12, type: "soft_skill", format: "in_person", capacity: 40, skill_tags: ["leadership", "feedback", "management"], created_by: users.adminDuarte },
  { _id: courses.ethicalHackingIntro, title: "Ethical Hacking Intro", description: "Learning the tools and tactics of penetration testers.", duration_hours: 40, type: "compliance", format: "online", capacity: 100, skill_tags: ["hacking", "pentesting", "security"], created_by: users.adminAna },
  { _id: courses.brandGuidelines2026, title: "Brand Guidelines 2026", description: "New logo usage and messaging standards.", duration_hours: 4, type: "soft_skill", format: "hybrid", capacity: 250, skill_tags: ["brand", "design", "marketing"], created_by: users.adminDuarte },
  { _id: courses.bigDataWithSpark, title: "Big Data with Spark", description: "Processing petabytes of logs efficiently.", duration_hours: 45, type: "technical", format: "online", capacity: 100, skill_tags: ["spark", "big-data", "analytics"], created_by: users.adminAna },
  { _id: courses.influencingWithoutAuthority, title: "Influencing Without Authority", description: "Getting buy-in from teams you don’t manage.", duration_hours: 16, type: "soft_skill", format: "in_person", capacity: 50, skill_tags: ["influence", "communication", "leadership"], created_by: users.adminDuarte },
  { _id: courses.workplaceSafetyForRemoteWorkers, title: "Workplace Safety for Remote Workers", description: "Setting up an ergonomic and safe home office.", duration_hours: 3, type: "soft_skill", format: "in_person", capacity: 200, skill_tags: ["safety", "remote", "ergonomics"], created_by: users.adminAna },
  { _id: courses.advancedCryptography, title: "Advanced Cryptography", description: "Post-quantum algorithms and elliptic curve math.", duration_hours: 55, type: "technical", format: "online", capacity: 60, skill_tags: ["cryptography", "security", "math"], created_by: users.adminAna },
  { _id: courses.contentMarketingStrategy, title: "Content Marketing Strategy", description: "Building brand authority through quality publishing.", duration_hours: 18, type: "soft_skill", format: "in_person", capacity: 60, skill_tags: ["marketing", "content", "strategy"], created_by: users.adminDuarte },
  { _id: courses.equalOpportunityEmployment, title: "Equal Opportunity Employment", description: "Compliance with fair hiring and promotion practices.", duration_hours: 6, type: "compliance", format: "hybrid", capacity: 150, skill_tags: ["compliance", "hiring", "legal"], created_by: users.adminAna },
  { _id: courses.webAssemblyWasmIntro, title: "Web Assembly (WASM) Intro", description: "Running C++ and Rust in the browser.", duration_hours: 30, type: "technical", format: "online", capacity: 100, skill_tags: ["wasm", "webassembly", "frontend", "rust"], created_by: users.adminDuarte },
  { _id: courses.customerSuccessFoundations, title: "Customer Success Foundations", description: "Reducing churn and increasing account expansion.", duration_hours: 20, type: "soft_skill", format: "in_person", capacity: 80, skill_tags: ["customer-success", "retention"], created_by: users.adminDuarte },
  { _id: courses.cyberEspionageDefense, title: "Cyber Espionage Defense", description: "Protecting corporate secrets from state-sponsored actors.", duration_hours: 50, type: "compliance", format: "in_person", capacity: 40, skill_tags: ["espionage", "cybersecurity", "compliance"], created_by: users.adminAna },
  { _id: courses.unconsciousBiasInPerformanceReviews, title: "Unconscious Bias in Performance Reviews", description: "Ensuring fairness in the annual review cycle.", duration_hours: 5, type: "soft_skill", format: "hybrid", capacity: 120, skill_tags: ["bias", "performance-reviews", "hr"], created_by: users.adminAna },
  { _id: courses.siteReliabilityEngineering, title: "Site Reliability Engineering", description: "Service level objectives and error budget management.", duration_hours: 40, type: "technical", format: "online", capacity: 90, skill_tags: ["sre", "devops", "reliability"], created_by: users.adminAna },
  { _id: courses.mobileAppAccessibility, title: "Mobile App Accessibility", description: "Building apps for users with visual and motor impairments.", duration_hours: 15, type: "technical", format: "hybrid", capacity: 80, skill_tags: ["mobile", "accessibility", "a11y"], created_by: users.adminDuarte },
  { _id: courses.socialMediaPolicy, title: "Social Media Policy", description: "Rules for representing the company on public platforms.", duration_hours: 2, type: "compliance", format: "in_person", capacity: 400, skill_tags: ["policy", "social-media", "compliance"], created_by: users.adminAna }
]);

db.sessions.insertMany([
  { _id: sessions.session1, course_id: courses.workplaceSecurity, date: ISODate('2026-05-05T09:00:00Z'), duration_minutes: 120, location: 'Headquarters - Auditorium A', description: 'Part 1: Foundational physical security protocols and entry access controls.' },
  { _id: sessions.session2, course_id: courses.cybersecurity101, date: ISODate('2026-05-19T14:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Introduction to foundational threat vectors, corporate phishing indicators, and security paradigms.' },
  { _id: sessions.session3, course_id: courses.complianceCrisis, date: ISODate('2026-05-20T10:00:00Z'), duration_minutes: 120, location: 'Headquarters - Room 302', description: 'Analyzing regulatory compliance workflows under incident response pressure.' },
  { _id: sessions.session4, course_id: courses.communicationMastery, date: ISODate('2026-06-15T09:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Advanced team alignment models, constructive feedback loops, and peer communication tools.' },
  { _id: sessions.session5, course_id: courses.aiForTeams, date: ISODate('2026-06-17T16:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Deep dive into responsible generative artificial intelligence tools for workflow optimization.' },
  { _id: sessions.session6, course_id: courses.onboardingFastTrack, date: ISODate('2026-07-01T09:30:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Core onboarding modules introducing systems engineering access profiles and target workspace environments.' },
  { _id: sessions.session7, course_id: courses.advancedCloudArchitecture, date: ISODate('2026-04-18T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Multi-region system deployments, continuous structural integrity configurations, and orchestration frameworks.' },
  { _id: sessions.session8, course_id: courses.antiBriberyAndCorruption, date: ISODate('2026-03-12T11:00:00Z'), duration_minutes: 90, location: 'London - Compliance Hall', description: 'Overview of enterprise legal policies regarding global market ethical standards.' },
  { _id: sessions.session9, course_id: courses.executiveLeadershipStrategy, date: ISODate('2026-09-10T10:00:00Z'), duration_minutes: 180, location: 'Berlin - Executive Boardroom', description: 'Long-term corporate roadmap alignment exercises and organizational execution strategies.' },
  { _id: sessions.session10, course_id: courses.introductionToAgileMethodology, date: ISODate('2026-05-04T14:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Scrum frameworks, iterative development backlogs, and Kanban workflow principles.' },
  { _id: sessions.session11, course_id: courses.gdprDataPrivacyStandards, date: ISODate('2026-09-05T10:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Reviewing statutory compliance requirements for European privacy protection protocols.' },
  { _id: sessions.session12, course_id: courses.maConfidentialProcedures, date: ISODate('2026-04-05T13:00:00Z'), duration_minutes: 90, location: 'Perth - Room Horizon', description: 'Procedures for managing private transaction metrics and sensitive asset disclosures.' },
  { _id: sessions.session13, course_id: courses.healthAndSafetyBasics, date: ISODate('2026-11-03T09:30:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Standard occupational health architectures and hazard reporting methods.' },
  { _id: sessions.session14, course_id: courses.pythonForDataAnalysis, date: ISODate('2026-05-14T11:00:00Z'), duration_minutes: 120, location: 'Dublin - Meeting Room B', description: 'Pandas vectorization techniques, algorithmic execution pipelines, and matrix structures.' },
  { _id: sessions.session15, course_id: courses.implicitBiasAwareness, date: ISODate('2026-01-20T10:00:00Z'), duration_minutes: 60, location: 'Braga - Innovation Room', description: 'Mitigating underlying systemic perspectives throughout institutional hiring patterns.' },
  { _id: sessions.session16, course_id: courses.blockchainInSupplyChain, date: ISODate('2026-04-20T09:30:00Z'), duration_minutes: 90, location: 'Paris - Room Lumière', description: 'Cryptographic ledger application strategies across distributed logistics channels.' },
  { _id: sessions.session17, course_id: courses.conflictResolutionForManagers, date: ISODate('2026-06-01T10:00:00Z'), duration_minutes: 60, location: 'London - Compliance Hall', description: 'Conflict de-escalation models and communication frameworks for engineering leaders.' },
  { _id: sessions.session18, course_id: courses.annualItSecurityRefresh, date: ISODate('2026-08-14T09:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Required annual overview of trending authentication threats and digital infrastructure security.' },
  { _id: sessions.session19, course_id: courses.machineLearningFundamentals, date: ISODate('2026-03-05T08:00:00Z'), duration_minutes: 120, location: 'Manila - Training Centre', description: 'Supervised vector algorithms, optimization matrices, and training baseline operations.' },
  { _id: sessions.session20, course_id: courses.publicSpeakingForTechies, date: ISODate('2026-02-15T13:00:00Z'), duration_minutes: 90, location: 'Barcelona - Auditorium C', description: 'Formulating precise presentations of abstract software concepts to business units.' },
  { _id: sessions.session21, course_id: courses.financialInsiderTradingPolicy, date: ISODate('2026-05-20T09:00:00Z'), duration_minutes: 90, location: 'Bangkok - Room Lotus', description: 'Statutory compliance requirements regarding material asymmetric market info.' },
  { _id: sessions.session22, course_id: courses.uxUiDesignSystems, date: ISODate('2026-04-10T13:00:00Z'), duration_minutes: 90, location: 'Nice - Training Room Côte', description: 'Managing cross-platform user experience frameworks using component design models.' },
  { _id: sessions.session23, course_id: courses.effectiveTimeManagement, date: ISODate('2026-08-01T11:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Priority-mapping frameworks and scheduling tactics to balance developer task allocations.' },
  { _id: sessions.session24, course_id: courses.corporateEthicsIntegrity, date: ISODate('2026-07-05T10:00:00Z'), duration_minutes: 60, location: 'Bangkok - Room Orchid', description: 'Navigating ethical boundaries across modern corporate operating models.' },
  { _id: sessions.session25, course_id: courses.advancedReactPatterns, date: ISODate('2026-02-12T09:30:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'State optimization matrices, micro-frontends architectures, and virtual rendering hooks.' },
  { _id: sessions.session26, course_id: courses.emotionalIntelligenceAtWork, date: ISODate('2026-05-15T09:00:00Z'), duration_minutes: 120, location: 'Bangkok - Room Jasmine', description: 'Developing organizational emotional awareness and cross-cultural empathy maps.' },
  { _id: sessions.session27, course_id: courses.whistleblowerTraining, date: ISODate('2026-07-20T15:30:00Z'), duration_minutes: 90, location: 'Oxford - Room Bodleian', description: 'Legal safe-harbor reporting procedures for highlighting regulatory misconduct.' },
  { _id: sessions.session28, course_id: courses.highPerformanceComputing, date: ISODate('2026-08-11T10:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'GPU thread configurations, parallel processing design, and compilation optimizations.' },
  { _id: sessions.session29, course_id: courses.customerSupportExcellence, date: ISODate('2026-02-10T14:00:00Z'), duration_minutes: 60, location: 'Oxford - Main Hall', description: 'De-escalation mechanisms for customer communication and SLA lifecycle optimization.' },
  { _id: sessions.session30, course_id: courses.sexualHarassmentPrevention, date: ISODate('2026-11-05T11:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Required guidelines for maintaining behavioral safety standards across active environments.' },
  { _id: sessions.session31, course_id: courses.kubernetesForOperators, date: ISODate('2026-08-25T10:00:00Z'), duration_minutes: 120, location: 'London - Room Thames', description: 'Operator framework paradigms, custom resource allocations, and orchestration cycles.' },
  { _id: sessions.session32, course_id: courses.negotiationSkillsForSales, date: ISODate('2026-10-15T13:00:00Z'), duration_minutes: 90, location: 'Madrid - Compliance Room 3', description: 'Strategic deal-structuring playbooks and value capture frameworks for enterprise sales.' },
  { _id: sessions.session33, course_id: courses.environmentalSustainability, date: ISODate('2026-04-12T11:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Corporate footprint reduction metrics and systemic green standard operations.' },
  { _id: sessions.session34, course_id: courses.deepLearningWithPyTorch, date: ISODate('2026-07-30T15:00:00Z'), duration_minutes: 90, location: 'Berlin - Room Tiergarten', description: 'Backpropagation calculations, layers fine-tuning, and neural network configurations.' },
  { _id: sessions.session35, course_id: courses.businessTravelPolicy, date: ISODate('2026-04-14T14:00:00Z'), duration_minutes: 120, location: 'Chicago - Room Midway', description: 'Expense framework governance and travel health logistics protocols.' },
  { _id: sessions.session36, course_id: courses.mentorshipProgramKickoff, date: ISODate('2026-02-18T10:00:00Z'), duration_minutes: 90, location: 'Austin - Room Lone Star', description: 'Formulating career path progression structures and objective framework baselines.' },
  { _id: sessions.session37, course_id: courses.cyberResilienceStrategy, date: ISODate('2026-10-10T09:00:00Z'), duration_minutes: 120, location: 'Chicago - Lab Safety Room', description: 'Disaster recovery mechanics, data backup routing, and failover architectures.' },
  { _id: sessions.session38, course_id: courses.diversityInTheWorkplace, date: ISODate('2026-08-22T13:30:00Z'), duration_minutes: 120, location: 'Lisbon - Room Tejo', description: 'Fostering cultural diversity parameters across agile modern tech squads.' },
  { _id: sessions.session39, course_id: courses.effectiveRemoteWork, date: ISODate('2026-06-05T10:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Async work tracking, home workplace configurations, and distributed context alignments.' },
  { _id: sessions.session40, course_id: courses.sqlAdvancedQuerying, date: ISODate('2026-02-01T13:30:00Z'), duration_minutes: 60, location: 'Sydney - Room Harbour', description: 'Analytical window syntax operations, database indexing models, and query planning.' },
  { _id: sessions.session41, course_id: courses.workplaceViolenceAwareness, date: ISODate('2026-10-22T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Identifying indicators of workplace distress and implementing swift reporting structures.' },
  { _id: sessions.session42, course_id: courses.enterpriseSeoBasics, date: ISODate('2026-10-30T13:00:00Z'), duration_minutes: 90, location: 'Brussels - Room Atomium', description: 'Crawling algorithm behaviors, search metrics tracking, and platform ranking frameworks.' },
  { _id: sessions.session43, course_id: courses.strategicThinkingForVPs, date: ISODate('2026-02-14T10:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Evaluating long-term market disruptions and driving structural pivots.' },
  { _id: sessions.session44, course_id: courses.itServiceManagementItil, date: ISODate('2026-03-22T11:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Incident tracking governance models and technical service level delivery structures.' },
  { _id: sessions.session45, course_id: courses.naturalLanguageProcessing, date: ISODate('2026-05-18T14:30:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Text processing structures, tokenization algorithms, and vector space analytics.' },
  { _id: sessions.session46, course_id: courses.activeListenerTraining, date: ISODate('2026-09-12T10:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Cognitive presence strategies and feedback reflecting paradigms for leaders.' },
  { _id: sessions.session47, course_id: courses.globalExportControls, date: ISODate('2026-06-25T13:00:00Z'), duration_minutes: 120, location: 'London - Main Meeting Hall', description: 'International trade restriction compliance and algorithmic export classification rules.' },
  { _id: sessions.session48, course_id: courses.microservicesWithGo, date: ISODate('2026-11-20T15:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Concurrency structures via Go channels, API interfaces, and service telemetry mapping.' },
  { _id: sessions.session49, course_id: courses.marketingAnalyticsRoi, date: ISODate('2026-01-18T10:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Multi-touch traffic attribution modeling and operational revenue performance.' },
  { _id: sessions.session50, course_id: courses.onboardingForNewManagers, date: ISODate('2026-04-12T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Managing cross-functional reporting structures and performance tracking policies.' },
  { _id: sessions.session51, course_id: courses.legalPatentFiling101, date: ISODate('2026-08-10T14:00:00Z'), duration_minutes: 120, location: 'Berlin - Room Charlottenburg', description: 'Formulating engineering IP frameworks and claims mapping documentation.' },
  { _id: sessions.session52, course_id: courses.cloudSecurityBestPractices, date: ISODate('2026-11-12T11:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'IAM role minimization strategies and multi-tenant isolation barriers.' },
  { _id: sessions.session53, course_id: courses.fireSafetyAndPrevention, date: ISODate('2026-12-15T15:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Facility safe egress path execution and hazard prevention workflows.' },
  { _id: sessions.session54, course_id: courses.terraformInfrastructureAsCode, date: ISODate('2026-05-10T10:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'State lock orchestration mechanics and module delivery definitions.' },
  { _id: sessions.session55, course_id: courses.agileProductManagement, date: ISODate('2026-06-14T11:00:00Z'), duration_minutes: 90, location: 'Amsterdam - Workspace Alpha', description: 'Validating iterative product telemetry metrics and delivery workflows.' },
  { _id: sessions.session56, course_id: courses.workplaceWellness, date: ISODate('2026-07-22T13:00:00Z'), duration_minutes: 60, location: 'Online - Meet', description: 'Ergonomic workspace designs and operational mental burnout avoidance strategies.' },
  { _id: sessions.session57, course_id: courses.devSecOpsIntegration, date: ISODate('2026-08-05T09:30:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Integrating continuous static application security scanning rules inside deployment pipelines.' },
  { _id: sessions.session58, course_id: courses.changeManagementFrameworks, date: ISODate('2026-09-18T14:00:00Z'), duration_minutes: 90, location: 'Frankfurt - Room Main', description: 'Navigating organizational restructuring behaviors and mapping communication strategies.' },
  { _id: sessions.session59, course_id: courses.hipaaDataCompliance, date: ISODate('2026-10-04T10:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Architecting end-to-end data transmission layers for health recording metrics.' },
  { _id: sessions.session60, course_id: courses.quantumComputingIntro, date: ISODate('2026-11-15T16:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Mathematical quantum gate state spaces and algorithmic linear mechanics.' },
  { _id: sessions.session61, course_id: courses.scrumMasterCertification, date: ISODate('2026-12-02T09:00:00Z'), duration_minutes: 120, location: 'Munich - Agile Hub', description: 'Agile execution metrics tracking, team velocity management, and block removal cycles.' },
  { _id: sessions.session62, course_id: courses.employeeRightsLaborLaws, date: ISODate('2026-01-25T11:30:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Overview of regional workforce statutory mandates and human resources regulations.' },
  { _id: sessions.session63, course_id: courses.kubernetesAdvancedNetworking, date: ISODate('2026-02-28T14:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Container Network Interfaces routing logic, service mesh topologies, and ingress rules.' },
  { _id: sessions.session64, course_id: courses.customerFeedbackLoop, date: ISODate('2026-03-18T10:00:00Z'), duration_minutes: 90, location: 'Stockholm - Room Nordic', description: 'Systematizing user survey feedback ingestion matrices and engineering iteration mapping.' },
  { _id: sessions.session65, course_id: courses.annualPolicyReview2026, date: ISODate('2026-04-30T15:00:00Z'), duration_minutes: 60, location: 'Online - Teams', description: 'Mandatory annual legal protocol refresh and safe behavior adjustments.' },
  { _id: sessions.session66, course_id: courses.rustForSystemsProgramming, date: ISODate('2026-05-24T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Compiling target execution safety layers using linear memory lifecycle paradigms.' },
  { _id: sessions.session67, course_id: courses.publicSpeakingKeynotes, date: ISODate('2026-06-11T13:00:00Z'), duration_minutes: 120, location: 'London - Theater Stage', description: 'Audience alignment structures, physical pacing mechanics, and content narrative loops.' },
  { _id: sessions.session68, course_id: courses.antiHarassmentTraining, date: ISODate('2026-07-19T10:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Promoting a collaborative professional workspace environment and peer support steps.' },
  { _id: sessions.session69, course_id: courses.executivePresentingSkills, date: ISODate('2026-08-08T14:30:00Z'), duration_minutes: 120, location: 'New York - Boardroom A', description: 'Communicating investment performance and multi-year strategy maps clearly to investors.' },
  { _id: sessions.session70, course_id: courses.graphqlApiDesign, date: ISODate('2026-09-21T11:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Formulating object type graph schemas, resolver optimization paths, and query complexity rules.' },
  { _id: sessions.session71, course_id: courses.corporateTaxLaws, date: ISODate('2026-10-12T09:30:00Z'), duration_minutes: 150, location: 'Zurich - Finance Center', description: 'Compliance strategies for cross-border financial entity reporting and trade structures.' },
  { _id: sessions.session72, course_id: courses.zeroTrustSecurityArchitect, date: ISODate('2026-11-08T13:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Contextual continuous authentication layers and perimeter isolation configurations.' },
  { _id: sessions.session73, course_id: courses.storytellingForSales, date: ISODate('2026-12-05T10:30:00Z'), duration_minutes: 90, location: 'Chicago - Sales Lab', description: 'Building value narratives that map corporate infrastructure features directly to client needs.' },
  { _id: sessions.session74, course_id: courses.hazardousMaterialsHandling, date: ISODate('2026-01-14T14:00:00Z'), duration_minutes: 120, location: 'Boston - R&D Facility', description: 'Chemical container containment rules and emergency neutralization processes.' },
  { _id: sessions.session75, course_id: courses.aiModelFineTuning, date: ISODate('2026-02-20T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Parameter-efficient adapters training configurations and weights distribution optimization.' },
  { _id: sessions.session76, course_id: courses.projectManagementFoundations, date: ISODate('2026-03-15T11:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Defining project task dependencies, scope baseline paths, and milestone resource management.' },
  { _id: sessions.session77, course_id: courses.dataPrivacyForEngineers, date: ISODate('2026-04-11T13:30:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Implementing local storage token masking and encrypted data collection filters.' },
  { _id: sessions.session78, course_id: courses.searchEngineAlgorithms, date: ISODate('2026-05-30T10:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Information parsing, indexing graphs weighting matrices, and retrieval scoring mechanics.' },
  { _id: sessions.session79, course_id: courses.personalFinanceForEmployees, date: ISODate('2026-06-22T15:00:00Z'), duration_minutes: 60, location: 'Online - Meet', description: 'Corporate benefit distributions asset matching configurations and savings portfolios.' },
  { _id: sessions.session80, course_id: courses.insiderThreatMitigation, date: ISODate('2026-07-14T09:30:00Z'), duration_minutes: 120, location: 'Washington - Secure Room', description: 'Behavioral pattern anomaly models and automated high-risk file export detection.' },
  { _id: sessions.session81, course_id: courses.fpgaProgramming, date: ISODate('2026-08-19T11:00:00Z'), duration_minutes: 150, location: 'Online - Meet', description: 'Synthesizing gate logic configurations using hardware definition script layers.' },
  { _id: sessions.session82, course_id: courses.leadership360Feedback, date: ISODate('2026-09-03T14:00:00Z'), duration_minutes: 120, location: 'Geneva - Leadership Space', description: 'Processing anonymized team evaluation metrics and forming strategic performance roadmaps.' },
  { _id: sessions.session83, course_id: courses.ethicalHackingIntro, date: ISODate('2026-10-18T10:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Simulated penetration vector mapping, payload delivery, and port parsing mechanics.' },
  { _id: sessions.session84, course_id: courses.brandGuidelines2026, date: ISODate('2026-11-25T13:00:00Z'), duration_minutes: 60, location: 'Online - Meet', description: 'Design asset updates overview, interface color rules, and media communication frameworks.' },
  { _id: sessions.session85, course_id: courses.bigDataWithSpark, date: ISODate('2026-12-11T09:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Resilient Distributed Dataset partitioning frameworks and memory caching strategies.' },
  { _id: sessions.session86, course_id: courses.influencingWithoutAuthority, date: ISODate('2026-01-10T14:00:00Z'), duration_minutes: 90, location: 'Vienna - Room Danube', description: 'Building cross-organizational stakeholder networks and alignment mechanics.' },
  { _id: sessions.session87, course_id: courses.workplaceSafetyForRemoteWorkers, date: ISODate('2026-02-05T11:00:00Z'), duration_minutes: 60, location: 'Online - Teams', description: 'Remote network infrastructure hardware parameters and electrical safety baselines.' },
  { _id: sessions.session88, course_id: courses.advancedCryptography, date: ISODate('2026-03-24T10:00:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Elliptic curve math frameworks, key generation distributions, and zero-knowledge patterns.' },
  { _id: sessions.session89, course_id: courses.contentMarketingStrategy, date: ISODate('2026-04-15T15:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Audience content delivery lifecycle modeling and retention tracking parameters.' },
  { _id: sessions.session90, course_id: courses.equalOpportunityEmployment, date: ISODate('2026-05-12T13:00:00Z'), duration_minutes: 90, location: 'Madrid - Room Prado', description: 'Statutory recruitment frameworks review and nondiscriminatory evaluation parameters.' },
  { _id: sessions.session91, course_id: courses.webAssemblyWasmIntro, date: ISODate('2026-06-20T09:30:00Z'), duration_minutes: 120, location: 'Online - Meet', description: 'Low-level compilation pipelines inside browser execution runtimes.' },
  { _id: sessions.session92, course_id: courses.customerSuccessFoundations, date: ISODate('2026-07-11T14:00:00Z'), duration_minutes: 90, location: 'Online - Teams', description: 'Ingestion tracking frameworks for client churn indicators and optimization methods.' },
  { _id: sessions.session93, course_id: courses.cyberEspionageDefense, date: ISODate('2026-08-30T10:00:00Z'), duration_minutes: 120, location: 'Tokyo - Security Room', description: 'Analyzing persistent advanced advanced persistent threats and target access indicators.' },
  { _id: sessions.session94, course_id: courses.unconsciousBiasInPerformanceReviews, date: ISODate('2026-09-14T15:30:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Objectifying evaluation metrics loops and removing systemic subjective scaling.' },
  { _id: sessions.session95, course_id: courses.siteReliabilityEngineering, date: ISODate('2026-10-25T11:00:00Z'), duration_minutes: 120, location: 'Online - Teams', description: 'Service Level Objective allocation structures and automated error budget alert loops.' },
  { _id: sessions.session96, course_id: courses.mobileAppAccessibility, date: ISODate('2026-11-18T14:00:00Z'), duration_minutes: 90, location: 'Online - Meet', description: 'Mobile screen reader focus parameters and platform gesture accessibility structures.' }
]);

db.enrollments.insertMany([
  { _id: enrollments.enrollment1, user_id: users.adminAna, course_id: courses.workplaceSecurity, status: 'completed', enrolled_at: ISODate('2026-04-10T09:00:00Z'), completed_at: ISODate('2026-05-05T11:00:00Z'), session_attendance: [{ session_id: sessions.session1, attended: true, attended_at: ISODate('2026-05-05T11:00:00Z') }] },
  { _id: enrollments.enrollment2, user_id: users.adminAna, course_id: courses.cybersecurity101, status: 'ongoing', enrolled_at: ISODate('2026-04-15T10:30:00Z'), session_attendance: [{ session_id: sessions.session2, attended: false }] },
  { _id: enrollments.enrollment3, user_id: users.adminDuarte, course_id: courses.complianceCrisis, status: 'ongoing', enrolled_at: ISODate('2026-04-20T11:00:00Z'), session_attendance: [{ session_id: sessions.session3, attended: false }] },
  { _id: enrollments.enrollment4, user_id: users.adminDuarte, course_id: courses.communicationMastery, status: 'ongoing', enrolled_at: ISODate('2026-05-01T08:45:00Z'), session_attendance: [{ session_id: sessions.session4, attended: false }] },
  { _id: enrollments.enrollment5, user_id: users.mgrMarta, course_id: courses.aiForTeams, status: 'ongoing', enrolled_at: ISODate('2026-05-02T14:20:00Z'), session_attendance: [{ session_id: sessions.session5, attended: false }] },
  { _id: enrollments.enrollment6, user_id: users.mgrMarta, course_id: courses.onboardingFastTrack, status: 'ongoing', enrolled_at: ISODate('2026-05-03T09:15:00Z'), session_attendance: [{ session_id: sessions.session6, attended: false }] },
  { _id: enrollments.enrollment7, user_id: users.mgrSergio, course_id: courses.advancedCloudArchitecture, status: 'completed', enrolled_at: ISODate('2026-03-15T10:00:00Z'), completed_at: ISODate('2026-04-18T11:00:00Z'), session_attendance: [{ session_id: sessions.session7, attended: true, attended_at: ISODate('2026-04-18T11:00:00Z') }] },
  { _id: enrollments.enrollment8, user_id: users.mgrSergio, course_id: courses.antiBriberyAndCorruption, status: 'completed', enrolled_at: ISODate('2026-02-20T13:00:00Z'), completed_at: ISODate('2026-03-12T12:30:00Z'), session_attendance: [{ session_id: sessions.session8, attended: true, attended_at: ISODate('2026-03-12T12:30:00Z') }] },
  { _id: enrollments.enrollment9, user_id: users.mgrInes, course_id: courses.executiveLeadershipStrategy, status: 'ongoing', enrolled_at: ISODate('2026-05-10T16:00:00Z'), session_attendance: [{ session_id: sessions.session9, attended: false }] },
  { _id: enrollments.enrollment10, user_id: users.mgrInes, course_id: courses.introductionToAgileMethodology, status: 'completed', enrolled_at: ISODate('2026-04-01T11:30:00Z'), completed_at: ISODate('2026-05-04T16:00:00Z'), session_attendance: [{ session_id: sessions.session10, attended: true, attended_at: ISODate('2026-05-04T16:00:00Z') }] },
  { _id: enrollments.enrollment11, user_id: users.mgrPaulo, course_id: courses.gdprDataPrivacyStandards, status: 'ongoing', enrolled_at: ISODate('2026-05-12T10:15:00Z'), session_attendance: [{ session_id: sessions.session11, attended: false }] },
  { _id: enrollments.enrollment12, user_id: users.mgrPaulo, course_id: courses.maConfidentialProcedures, status: 'completed', enrolled_at: ISODate('2026-03-01T09:00:00Z'), completed_at: ISODate('2026-04-05T14:30:00Z'), session_attendance: [{ session_id: sessions.session12, attended: true, attended_at: ISODate('2026-04-05T14:30:00Z') }] },
  { _id: enrollments.enrollment13, user_id: users.mgrMario, course_id: courses.healthAndSafetyBasics, status: 'ongoing', enrolled_at: ISODate('2026-05-14T15:00:00Z'), session_attendance: [{ session_id: sessions.session13, attended: false }] },
  { _id: enrollments.enrollment14, user_id: users.mgrMario, course_id: courses.pythonForDataAnalysis, status: 'completed', enrolled_at: ISODate('2026-04-12T10:00:00Z'), completed_at: ISODate('2026-05-14T13:00:00Z'), session_attendance: [{ session_id: sessions.session14, attended: true, attended_at: ISODate('2026-05-14T13:00:00Z') }] },
  { _id: enrollments.enrollment15, user_id: users.empJoao, course_id: courses.implicitBiasAwareness, status: 'completed', enrolled_at: ISODate('2025-12-15T08:30:00Z'), completed_at: ISODate('2026-01-20T11:00:00Z'), session_attendance: [{ session_id: sessions.session15, attended: true, attended_at: ISODate('2026-01-20T11:00:00Z') }] },
  { _id: enrollments.enrollment16, user_id: users.empJoao, course_id: courses.blockchainInSupplyChain, status: 'completed', enrolled_at: ISODate('2026-03-10T14:00:00Z'), completed_at: ISODate('2026-04-20T11:00:00Z'), session_attendance: [{ session_id: sessions.session16, attended: true, attended_at: ISODate('2026-04-20T11:00:00Z') }] },
  { _id: enrollments.enrollment17, user_id: users.empRita, course_id: courses.conflictResolutionForManagers, status: 'ongoing', enrolled_at: ISODate('2026-05-15T11:00:00Z'), session_attendance: [{ session_id: sessions.session17, attended: false }] },
  { _id: enrollments.enrollment18, user_id: users.empRita, course_id: courses.annualItSecurityRefresh, status: 'ongoing', enrolled_at: ISODate('2026-05-16T13:45:00Z'), session_attendance: [{ session_id: sessions.session18, attended: false }] },
  { _id: enrollments.enrollment19, user_id: users.empLuis, course_id: courses.machineLearningFundamentals, status: 'completed', enrolled_at: ISODate('2026-02-01T09:00:00Z'), completed_at: ISODate('2026-03-05T10:00:00Z'), session_attendance: [{ session_id: sessions.session19, attended: true, attended_at: ISODate('2026-03-05T10:00:00Z') }] },
  { _id: enrollments.enrollment20, user_id: users.empLuis, course_id: courses.publicSpeakingForTechies, status: 'completed', enrolled_at: ISODate('2026-01-10T10:30:00Z'), completed_at: ISODate('2026-02-15T14:30:00Z'), session_attendance: [{ session_id: sessions.session20, attended: true, attended_at: ISODate('2026-02-15T14:30:00Z') }] },
  { _id: enrollments.enrollment21, user_id: users.empSofia, course_id: courses.financialInsiderTradingPolicy, status: 'completed', enrolled_at: ISODate('2026-04-18T15:20:00Z'), completed_at: ISODate('2026-05-20T10:30:00Z'), session_attendance: [{ session_id: sessions.session21, attended: true, attended_at: ISODate('2026-05-20T10:30:00Z') }] },
  { _id: enrollments.enrollment22, user_id: users.empSofia, course_id: courses.uxUiDesignSystems, status: 'completed', enrolled_at: ISODate('2026-03-05T11:00:00Z'), completed_at: ISODate('2026-04-10T14:30:00Z'), session_attendance: [{ session_id: sessions.session22, attended: true, attended_at: ISODate('2026-04-10T14:30:00Z') }] },
  { _id: enrollments.enrollment23, user_id: users.empMiguel, course_id: courses.effectiveTimeManagement, status: 'ongoing', enrolled_at: ISODate('2026-05-18T09:00:00Z'), session_attendance: [{ session_id: sessions.session23, attended: false }] },
  { _id: enrollments.enrollment24, user_id: users.empMiguel, course_id: courses.corporateEthicsIntegrity, status: 'ongoing', enrolled_at: ISODate('2026-05-19T10:15:00Z'), session_attendance: [{ session_id: sessions.session24, attended: false }] },
  { _id: enrollments.enrollment25, user_id: users.empEva, course_id: courses.advancedReactPatterns, status: 'completed', enrolled_at: ISODate('2026-01-15T14:00:00Z'), completed_at: ISODate('2026-02-12T11:00:00Z'), session_attendance: [{ session_id: sessions.session25, attended: true, attended_at: ISODate('2026-02-12T11:00:00Z') }] },
  { _id: enrollments.enrollment26, user_id: users.empEva, course_id: courses.emotionalIntelligenceAtWork, status: 'completed', enrolled_at: ISODate('2026-04-02T13:10:00Z'), completed_at: ISODate('2026-05-15T11:00:00Z'), session_attendance: [{ session_id: sessions.session26, attended: true, attended_at: ISODate('2026-05-15T11:00:00Z') }] },
  { _id: enrollments.enrollment27, user_id: users.empTomas, course_id: courses.whistleblowerTraining, status: 'ongoing', enrolled_at: ISODate('2026-05-20T11:30:00Z'), session_attendance: [{ session_id: sessions.session27, attended: false }] },
  { _id: enrollments.enrollment28, user_id: users.empTomas, course_id: courses.highPerformanceComputing, status: 'ongoing', enrolled_at: ISODate('2026-05-21T09:00:00Z'), session_attendance: [{ session_id: sessions.session28, attended: false }] },
  { _id: enrollments.enrollment29, user_id: users.empCarla, course_id: courses.customerSupportExcellence, status: 'completed', enrolled_at: ISODate('2026-01-05T10:00:00Z'), completed_at: ISODate('2026-02-10T15:00:00Z'), session_attendance: [{ session_id: sessions.session29, attended: true, attended_at: ISODate('2026-02-10T15:00:00Z') }] },
  { _id: enrollments.enrollment30, user_id: users.empCarla, course_id: courses.sexualHarassmentPrevention, status: 'ongoing', enrolled_at: ISODate('2026-05-22T14:00:00Z'), session_attendance: [{ session_id: sessions.session30, attended: false }] },
  { _id: enrollments.enrollment31, user_id: users.empBruno, course_id: courses.kubernetesForOperators, status: 'ongoing', enrolled_at: ISODate('2026-05-23T10:30:00Z'), session_attendance: [{ session_id: sessions.session31, attended: false }] },
  { _id: enrollments.enrollment32, user_id: users.empBruno, course_id: courses.negotiationSkillsForSales, status: 'ongoing', enrolled_at: ISODate('2026-05-24T16:00:00Z'), session_attendance: [{ session_id: sessions.session32, attended: false }] },
  { _id: enrollments.enrollment33, user_id: users.empMafalda, course_id: courses.environmentalSustainability, status: 'completed', enrolled_at: ISODate('2026-03-12T09:00:00Z'), completed_at: ISODate('2026-04-12T13:00:00Z'), session_attendance: [{ session_id: sessions.session33, attended: true, attended_at: ISODate('2026-04-12T13:00:00Z') }] },
  { _id: enrollments.enrollment34, user_id: users.empMafalda, course_id: courses.deepLearningWithPyTorch, status: 'ongoing', enrolled_at: ISODate('2026-05-25T11:15:00Z'), session_attendance: [{ session_id: sessions.session34, attended: false }] },
  { _id: enrollments.enrollment35, user_id: users.empNuno, course_id: courses.businessTravelPolicy, status: 'completed', enrolled_at: ISODate('2026-03-14T10:00:00Z'), completed_at: ISODate('2026-04-14T16:00:00Z'), session_attendance: [{ session_id: sessions.session35, attended: true, attended_at: ISODate('2026-04-14T16:00:00Z') }] },
  { _id: enrollments.enrollment36, user_id: users.empNuno, course_id: courses.mentorshipProgramKickoff, status: 'completed', enrolled_at: ISODate('2026-01-20T14:30:00Z'), completed_at: ISODate('2026-02-18T11:30:00Z'), session_attendance: [{ session_id: sessions.session36, attended: true, attended_at: ISODate('2026-02-18T11:30:00Z') }] },
  { _id: enrollments.enrollment37, user_id: users.empHelena, course_id: courses.cyberResilienceStrategy, status: 'ongoing', enrolled_at: ISODate('2026-05-26T09:00:00Z'), session_attendance: [{ session_id: sessions.session37, attended: false }] },
  { _id: enrollments.enrollment38, user_id: users.empHelena, course_id: courses.diversityInTheWorkplace, status: 'ongoing', enrolled_at: ISODate('2026-05-27T13:00:00Z'), session_attendance: [{ session_id: sessions.session38, attended: false }] },
  { _id: enrollments.enrollment39, user_id: users.empTiago, course_id: courses.effectiveRemoteWork, status: 'ongoing', enrolled_at: ISODate('2026-05-28T10:00:00Z'), session_attendance: [{ session_id: sessions.session39, attended: false }] },
  { _id: enrollments.enrollment40, user_id: users.empTiago, course_id: courses.sqlAdvancedQuerying, status: 'completed', enrolled_at: ISODate('2026-01-04T15:00:00Z'), completed_at: ISODate('2026-02-01T14:30:00Z'), session_attendance: [{ session_id: sessions.session40, attended: true, attended_at: ISODate('2026-02-01T14:30:00Z') }] },
  { _id: enrollments.enrollment41, user_id: users.empLea, course_id: courses.workplaceViolenceAwareness, status: 'ongoing', enrolled_at: ISODate('2026-05-29T11:30:00Z'), session_attendance: [{ session_id: sessions.session41, attended: false }] },
  { _id: enrollments.enrollment42, user_id: users.empLea, course_id: courses.enterpriseSeoBasics, status: 'ongoing', enrolled_at: ISODate('2026-05-30T09:00:00Z'), session_attendance: [{ session_id: sessions.session42, attended: false }] },
  { _id: enrollments.enrollment43, user_id: users.empBianca, course_id: courses.strategicThinkingForVPs, status: 'completed', enrolled_at: ISODate('2026-01-18T10:00:00Z'), completed_at: ISODate('2026-02-14T12:00:00Z'), session_attendance: [{ session_id: sessions.session43, attended: true, attended_at: ISODate('2026-02-14T12:00:00Z') }] },
  { _id: enrollments.enrollment44, user_id: users.empBianca, course_id: courses.itServiceManagementItil, status: 'completed', enrolled_at: ISODate('2026-02-25T14:00:00Z'), completed_at: ISODate('2026-03-22T13:00:00Z'), session_attendance: [{ session_id: sessions.session44, attended: true, attended_at: ISODate('2026-03-22T13:00:00Z') }] },
  { _id: enrollments.enrollment45, user_id: users.empAndre, course_id: courses.naturalLanguageProcessing, status: 'completed', enrolled_at: ISODate('2026-04-12T11:00:00Z'), completed_at: ISODate('2026-05-18T16:30:00Z'), session_attendance: [{ session_id: sessions.session45, attended: true, attended_at: ISODate('2026-05-18T16:30:00Z') }] },
  { _id: enrollments.enrollment46, user_id: users.empAndre, course_id: courses.activeListenerTraining, status: 'ongoing', enrolled_at: ISODate('2026-05-20T10:00:00Z'), session_attendance: [{ session_id: sessions.session46, attended: false }] },
  { _id: enrollments.enrollment47, user_id: users.empPatricia, course_id: courses.globalExportControls, status: 'ongoing', enrolled_at: ISODate('2026-05-21T13:45:00Z'), session_attendance: [{ session_id: sessions.session47, attended: false }] },
  { _id: enrollments.enrollment48, user_id: users.empPatricia, course_id: courses.microservicesWithGo, status: 'ongoing', enrolled_at: ISODate('2026-05-22T15:30:00Z'), session_attendance: [{ session_id: sessions.session48, attended: false }] },
  { _id: enrollments.enrollment49, user_id: users.empGoncalo, course_id: courses.marketingAnalyticsRoi, status: 'completed', enrolled_at: ISODate('2025-12-20T09:00:00Z'), completed_at: ISODate('2026-01-18T11:30:00Z'), session_attendance: [{ session_id: sessions.session49, attended: true, attended_at: ISODate('2026-01-18T11:30:00Z') }] },
  { _id: enrollments.enrollment50, user_id: users.empGoncalo, course_id: courses.onboardingForNewManagers, status: 'completed', enrolled_at: ISODate('2026-03-10T10:15:00Z'), completed_at: ISODate('2026-04-12T11:00:00Z'), session_attendance: [{ session_id: sessions.session50, attended: true, attended_at: ISODate('2026-04-12T11:00:00Z') }] },
  { _id: enrollments.enrollment51, user_id: users.empRaquel, course_id: courses.legalPatentFiling101, status: 'ongoing', enrolled_at: ISODate('2026-05-23T14:00:00Z'), session_attendance: [{ session_id: sessions.session51, attended: false }] },
  { _id: enrollments.enrollment52, user_id: users.empRaquel, course_id: courses.cloudSecurityBestPractices, status: 'ongoing', enrolled_at: ISODate('2026-05-24T11:00:00Z'), session_attendance: [{ session_id: sessions.session52, attended: false }] },
  { _id: enrollments.enrollment53, user_id: users.empVasco, course_id: courses.fireSafetyAndPrevention, status: 'ongoing', enrolled_at: ISODate('2026-05-25T16:20:00Z'), session_attendance: [{ session_id: sessions.session53, attended: false }] },
  { _id: enrollments.enrollment54, user_id: users.empVasco, course_id: courses.terraformInfrastructureAsCode, status: 'completed', enrolled_at: ISODate('2026-04-05T09:30:00Z'), completed_at: ISODate('2026-05-10T12:00:00Z'), session_attendance: [{ session_id: sessions.session54, attended: true, attended_at: ISODate('2026-05-10T12:00:00Z') }] },
  { _id: enrollments.enrollment55, user_id: users.empTeresa, course_id: courses.agileProductManagement, status: 'ongoing', enrolled_at: ISODate('2026-05-26T10:00:00Z'), session_attendance: [{ session_id: sessions.session55, attended: false }] },
  { _id: enrollments.enrollment56, user_id: users.empTeresa, course_id: courses.workplaceWellness, status: 'ongoing', enrolled_at: ISODate('2026-05-27T14:15:00Z'), session_attendance: [{ session_id: sessions.session56, attended: false }] },
  { _id: enrollments.enrollment57, user_id: users.empDiogo, course_id: courses.devSecOpsIntegration, status: 'ongoing', enrolled_at: ISODate('2026-05-28T11:00:00Z'), session_attendance: [{ session_id: sessions.session57, attended: false }] },
  { _id: enrollments.enrollment58, user_id: users.empDiogo, course_id: courses.changeManagementFrameworks, status: 'ongoing', enrolled_at: ISODate('2026-05-29T09:45:00Z'), session_attendance: [{ session_id: sessions.session58, attended: false }] },
  { _id: enrollments.enrollment59, user_id: users.empLuis2, course_id: courses.hipaaDataCompliance, status: 'ongoing', enrolled_at: ISODate('2026-05-30T13:00:00Z'), session_attendance: [{ session_id: sessions.session59, attended: false }] },
  { _id: enrollments.enrollment60, user_id: users.empLuis2, course_id: courses.quantumComputingIntro, status: 'ongoing', enrolled_at: ISODate('2026-05-31T10:30:00Z'), session_attendance: [{ session_id: sessions.session60, attended: false }] },
  { _id: enrollments.enrollment61, user_id: users.empNuno2, course_id: courses.scrumMasterCertification, status: 'ongoing', enrolled_at: ISODate('2026-05-20T15:00:00Z'), session_attendance: [{ session_id: sessions.session61, attended: false }] },
  { _id: enrollments.enrollment62, user_id: users.empNuno2, course_id: courses.employeeRightsLaborLaws, status: 'completed', enrolled_at: ISODate('2025-12-28T09:00:00Z'), completed_at: ISODate('2026-01-25T13:00:00Z'), session_attendance: [{ session_id: sessions.session62, attended: true, attended_at: ISODate('2026-01-25T13:00:00Z') }] },
  { _id: enrollments.enrollment63, user_id: users.empDiogo2, course_id: courses.kubernetesAdvancedNetworking, status: 'completed', enrolled_at: ISODate('2026-01-30T10:00:00Z'), completed_at: ISODate('2026-02-28T16:00:00Z'), session_attendance: [{ session_id: sessions.session63, attended: true, attended_at: ISODate('2026-02-28T16:00:00Z') }] },
  { _id: enrollments.enrollment64, user_id: users.empDiogo2, course_id: courses.customerFeedbackLoop, status: 'completed', enrolled_at: ISODate('2026-02-20T14:00:00Z'), completed_at: ISODate('2026-03-18T11:30:00Z'), session_attendance: [{ session_id: sessions.session64, attended: true, attended_at: ISODate('2026-03-18T11:30:00Z') }] },
  { _id: enrollments.enrollment65, user_id: users.empMiguel2, course_id: courses.annualPolicyReview2026, status: 'completed', enrolled_at: ISODate('2026-03-25T09:30:00Z'), completed_at: ISODate('2026-04-30T16:00:00Z'), session_attendance: [{ session_id: sessions.session65, attended: true, attended_at: ISODate('2026-04-30T16:00:00Z') }] },
  { _id: enrollments.enrollment66, user_id: users.empMiguel2, course_id: courses.rustForSystemsProgramming, status: 'completed', enrolled_at: ISODate('2026-04-20T11:00:00Z'), completed_at: ISODate('2026-05-24T11:00:00Z'), session_attendance: [{ session_id: sessions.session66, attended: true, attended_at: ISODate('2026-05-24T11:00:00Z') }] },
  { _id: enrollments.enrollment67, user_id: users.empRaquel2, course_id: courses.publicSpeakingKeynotes, status: 'ongoing', enrolled_at: ISODate('2026-05-21T13:00:00Z'), session_attendance: [{ session_id: sessions.session67, attended: false }] },
  { _id: enrollments.enrollment68, user_id: users.empRaquel2, course_id: courses.antiHarassmentTraining, status: 'ongoing', enrolled_at: ISODate('2026-05-22T10:30:00Z'), session_attendance: [{ session_id: sessions.session68, attended: false }] },
  { _id: enrollments.enrollment69, user_id: users.empVasco2, course_id: courses.executivePresentingSkills, status: 'ongoing', enrolled_at: ISODate('2026-05-23T15:45:00Z'), session_attendance: [{ session_id: sessions.session69, attended: false }] },
  { _id: enrollments.enrollment70, user_id: users.empVasco2, course_id: courses.graphqlApiDesign, status: 'ongoing', enrolled_at: ISODate('2026-05-24T09:15:00Z'), session_attendance: [{ session_id: sessions.session70, attended: false }] },
  { _id: enrollments.enrollment71, user_id: users.empCarla2, course_id: courses.corporateTaxLaws, status: 'ongoing', enrolled_at: ISODate('2026-05-25T11:00:00Z'), session_attendance: [{ session_id: sessions.session71, attended: false }] },
  { _id: enrollments.enrollment72, user_id: users.empCarla2, course_id: courses.zeroTrustSecurityArchitect, status: 'ongoing', enrolled_at: ISODate('2026-05-26T14:30:00Z'), session_attendance: [{ session_id: sessions.session72, attended: false }] },
  { _id: enrollments.enrollment73, user_id: users.empBruno2, course_id: courses.storytellingForSales, status: 'ongoing', enrolled_at: ISODate('2026-05-27T10:00:00Z'), session_attendance: [{ session_id: sessions.session73, attended: false }] },
  { _id: enrollments.enrollment74, user_id: users.empBruno2, course_id: courses.hazardousMaterialsHandling, status: 'completed', enrolled_at: ISODate('2025-12-10T13:00:00Z'), completed_at: ISODate('2026-01-14T16:00:00Z'), session_attendance: [{ session_id: sessions.session74, attended: true, attended_at: ISODate('2026-01-14T16:00:00Z') }] },
  { _id: enrollments.enrollment75, user_id: users.empMafalda2, course_id: courses.aiModelFineTuning, status: 'completed', enrolled_at: ISODate('2026-01-20T09:00:00Z'), completed_at: ISODate('2026-02-20T11:00:00Z'), session_attendance: [{ session_id: sessions.session75, attended: true, attended_at: ISODate('2026-02-20T11:00:00Z') }] },
  { _id: enrollments.enrollment76, user_id: users.empMafalda2, course_id: courses.projectManagementFoundations, status: 'completed', enrolled_at: ISODate('2026-02-15T11:30:00Z'), completed_at: ISODate('2026-03-15T12:30:00Z'), session_attendance: [{ session_id: sessions.session76, attended: true, attended_at: ISODate('2026-03-15T12:30:00Z') }] },
  { _id: enrollments.enrollment77, user_id: users.empHelena2, course_id: courses.dataPrivacyForEngineers, status: 'completed', enrolled_at: ISODate('2026-03-10T14:00:00Z'), completed_at: ISODate('2026-04-11T15:30:00Z'), session_attendance: [{ session_id: sessions.session77, attended: true, attended_at: ISODate('2026-04-11T15:30:00Z') }] },
  { _id: enrollments.enrollment78, user_id: users.empHelena2, course_id: courses.searchEngineAlgorithms, status: 'completed', enrolled_at: ISODate('2026-04-28T10:00:00Z'), completed_at: ISODate('2026-05-30T11:30:00Z'), session_attendance: [{ session_id: sessions.session78, attended: true, attended_at: ISODate('2026-05-30T11:30:00Z') }] },
  { _id: enrollments.enrollment79, user_id: users.empTiago2, course_id: courses.personalFinanceForEmployees, status: 'ongoing', enrolled_at: ISODate('2026-05-29T16:00:00Z'), session_attendance: [{ session_id: sessions.session79, attended: false }] },
  { _id: enrollments.enrollment80, user_id: users.empTiago2, course_id: courses.insiderThreatMitigation, status: 'ongoing', enrolled_at: ISODate('2026-05-30T11:00:00Z'), session_attendance: [{ session_id: sessions.session80, attended: false }] },
  { _id: enrollments.enrollment81, user_id: users.empLea2, course_id: courses.fpgaProgramming, status: 'ongoing', enrolled_at: ISODate('2026-05-20T13:15:00Z'), session_attendance: [{ session_id: sessions.session81, attended: false }] },
  { _id: enrollments.enrollment82, user_id: users.empLea2, course_id: courses.leadership360Feedback, status: 'ongoing', enrolled_at: ISODate('2026-05-21T09:30:00Z'), session_attendance: [{ session_id: sessions.session82, attended: false }] },
  { _id: enrollments.enrollment83, user_id: users.empBianca2, course_id: courses.ethicalHackingIntro, status: 'ongoing', enrolled_at: ISODate('2026-05-22T14:00:00Z'), session_attendance: [{ session_id: sessions.session83, attended: false }] },
  { _id: enrollments.enrollment84, user_id: users.empBianca2, course_id: courses.brandGuidelines2026, status: 'ongoing', enrolled_at: ISODate('2026-05-23T11:45:00Z'), session_attendance: [{ session_id: sessions.session84, attended: false }] },
  { _id: enrollments.enrollment85, user_id: users.empAndre2, course_id: courses.bigDataWithSpark, status: 'ongoing', enrolled_at: ISODate('2026-05-24T10:00:00Z'), session_attendance: [{ session_id: sessions.session85, attended: false }] },
  { _id: enrollments.enrollment86, user_id: users.empAndre2, course_id: courses.workplaceSafetyForRemoteWorkers, status: 'completed', enrolled_at: ISODate('2026-01-05T09:00:00Z'), completed_at: ISODate('2026-02-05T12:00:00Z'), session_attendance: [{ session_id: sessions.session87, attended: true, attended_at: ISODate('2026-02-05T12:00:00Z') }] },
  { _id: enrollments.enrollment87, user_id: users.empPatricia2, course_id: courses.influencingWithoutAuthority, status: 'completed', enrolled_at: ISODate('2025-12-12T14:00:00Z'), completed_at: ISODate('2026-01-10T15:30:00Z'), session_attendance: [{ session_id: sessions.session86, attended: true, attended_at: ISODate('2026-01-10T15:30:00Z') }] },
  { _id: enrollments.enrollment88, user_id: users.empPatricia2, course_id: courses.advancedCryptography, status: 'completed', enrolled_at: ISODate('2026-02-18T10:30:00Z'), completed_at: ISODate('2026-03-24T12:00:00Z'), session_attendance: [{ session_id: sessions.session88, attended: true, attended_at: ISODate('2026-03-24T12:00:00Z') }] },
  { _id: enrollments.enrollment89, user_id: users.empGoncalo2, course_id: courses.contentMarketingStrategy, status: 'completed', enrolled_at: ISODate('2026-03-11T13:00:00Z'), completed_at: ISODate('2026-04-15T16:30:00Z'), session_attendance: [{ session_id: sessions.session89, attended: true, attended_at: ISODate('2026-04-15T16:30:00Z') }] },
  { _id: enrollments.enrollment90, user_id: users.empGoncalo2, course_id: courses.equalOpportunityEmployment, status: 'completed', enrolled_at: ISODate('2026-04-05T11:00:00Z'), completed_at: ISODate('2026-05-12T14:30:00Z'), session_attendance: [{ session_id: sessions.session90, attended: true, attended_at: ISODate('2026-05-12T14:30:00Z') }] },
  { _id: enrollments.enrollment91, user_id: users.empRita2, course_id: courses.webAssemblyWasmIntro, status: 'ongoing', enrolled_at: ISODate('2026-05-25T15:00:00Z'), session_attendance: [{ session_id: sessions.session91, attended: false }] },
  { _id: enrollments.enrollment92, user_id: users.empRita2, course_id: courses.customerSuccessFoundations, status: 'ongoing', enrolled_at: ISODate('2026-05-26T10:15:00Z'), session_attendance: [{ session_id: sessions.session92, attended: false }] },
  { _id: enrollments.enrollment93, user_id: users.empTomas2, course_id: courses.cyberEspionageDefense, status: 'ongoing', enrolled_at: ISODate('2026-05-27T09:00:00Z'), session_attendance: [{ session_id: sessions.session93, attended: false }] },
  { _id: enrollments.enrollment94, user_id: users.empTomas2, course_id: courses.unconsciousBiasInPerformanceReviews, status: 'ongoing', enrolled_at: ISODate('2026-05-28T13:30:00Z'), session_attendance: [{ session_id: sessions.session94, attended: false }] },
  { _id: enrollments.enrollment95, user_id: users.partnerUser, course_id: courses.siteReliabilityEngineering, status: 'ongoing', enrolled_at: ISODate('2026-05-29T14:00:00Z'), session_attendance: [{ session_id: sessions.session95, attended: false }] },
  { _id: enrollments.enrollment96, user_id: users.partnerUser, course_id: courses.mobileAppAccessibility, status: 'ongoing', enrolled_at: ISODate('2026-05-30T10:00:00Z'), session_attendance: [{ session_id: sessions.session96, attended: false }] },
  { _id: ObjectId(), user_id: users.adminAna, course_id: courses.workplaceSecurity, status: 'completed', enrolled_at: ISODate('2026-04-10T09:00:00Z'), completed_at: ISODate('2026-05-05T11:00:00Z'), session_attendance: [{ session_id: sessions.session1, attended: true, attended_at: ISODate('2026-05-05T11:00:00Z') }, { session_id: sessions.session2, attended: false }] },
  { _id: ObjectId(), user_id: users.adminAna, course_id: courses.introductionToAgileMethodology, status: 'completed', enrolled_at: ISODate('2026-04-01T11:30:00Z'), completed_at: ISODate('2026-05-04T16:00:00Z'), session_attendance: [{ session_id: sessions.session10, attended: true, attended_at: ISODate('2026-05-04T16:00:00Z') }] },
  { _id: ObjectId(), user_id: users.adminAna, course_id: courses.pythonForDataAnalysis, status: 'completed', enrolled_at: ISODate('2026-04-12T10:00:00Z'), completed_at: ISODate('2026-05-14T13:00:00Z'), session_attendance: [{ session_id: sessions.session14, attended: true, attended_at: ISODate('2026-05-14T13:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empJoao, course_id: courses.implicitBiasAwareness, status: 'completed', enrolled_at: ISODate('2026-01-01T09:00:00Z'), completed_at: ISODate('2026-01-20T11:00:00Z'), session_attendance: [{ session_id: sessions.session15, attended: true, attended_at: ISODate('2026-01-20T11:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empLuis, course_id: courses.machineLearningFundamentals, status: 'completed', enrolled_at: ISODate('2026-01-05T10:00:00Z'), completed_at: ISODate('2026-01-25T12:00:00Z'), session_attendance: [{ session_id: sessions.session19, attended: true, attended_at: ISODate('2026-01-25T12:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empSofia, course_id: courses.publicSpeakingForTechies, status: 'completed', enrolled_at: ISODate('2026-01-10T14:30:00Z'), completed_at: ISODate('2026-01-28T16:00:00Z'), session_attendance: [{ session_id: sessions.session20, attended: true, attended_at: ISODate('2026-01-28T16:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empRita, course_id: courses.advancedReactPatterns, status: 'completed', enrolled_at: ISODate('2026-02-01T08:30:00Z'), completed_at: ISODate('2026-02-12T11:00:00Z'), session_attendance: [{ session_id: sessions.session25, attended: true, attended_at: ISODate('2026-02-12T11:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empAndre, course_id: courses.emotionalIntelligenceAtWork, status: 'completed', enrolled_at: ISODate('2026-02-02T13:00:00Z'), completed_at: ISODate('2026-02-15T11:00:00Z'), session_attendance: [{ session_id: sessions.session26, attended: true, attended_at: ISODate('2026-02-15T11:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empDiogo, course_id: courses.customerSupportExcellence, status: 'completed', enrolled_at: ISODate('2026-02-05T10:00:00Z'), completed_at: ISODate('2026-02-18T15:00:00Z'), session_attendance: [{ session_id: sessions.session29, attended: true, attended_at: ISODate('2026-02-18T15:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empJoao, course_id: courses.deepLearningWithPyTorch, status: 'completed', enrolled_at: ISODate('2026-03-01T11:00:00Z'), completed_at: ISODate('2026-03-15T12:30:00Z'), session_attendance: [{ session_id: sessions.session34, attended: true, attended_at: ISODate('2026-03-15T12:30:00Z') }] },
  { _id: ObjectId(), user_id: users.empLuis, course_id: courses.mentorshipProgramKickoff, status: 'completed', enrolled_at: ISODate('2026-03-02T14:00:00Z'), completed_at: ISODate('2026-03-18T16:00:00Z'), session_attendance: [{ session_id: sessions.session36, attended: true, attended_at: ISODate('2026-03-18T16:00:00Z') }] },
  { _id: ObjectId(), user_id: users.empSofia, course_id: courses.sqlAdvancedQuerying, status: 'completed', enrolled_at: ISODate('2026-03-05T09:30:00Z'), completed_at: ISODate('2026-03-22T11:30:00Z'), session_attendance: [{ session_id: sessions.session40, attended: true, attended_at: ISODate('2026-03-22T11:30:00Z') }] }
]);

db.courses.updateMany(
  { image_url: { $exists: false } },
  { $set: { image_url: 'http://localhost:5000/static/course-images/default-course.svg' } }
);

db.reviews.insertMany([
  { course_id: courses.workplaceSecurity, user_id: users.empRaquel2, rating: 4, comment: "Practical breakdown of tailoring security practices for dynamic remote teams.", created_at: ISODate("2026-03-01T10:15:00Z") },
  { course_id: courses.workplaceSecurity, user_id: users.empVasco2, rating: 5, comment: "Clear instruction on tailgating prevention and locking down external peripherals.", created_at: ISODate("2026-03-04T14:22:00Z") },
  { course_id: courses.cybersecurity101, user_id: users.empCarla2, rating: 5, comment: "The defensive principles and code vulnerability drills are essential for any support engineer.", created_at: ISODate("2026-04-10T09:45:00Z") },
  { course_id: courses.cybersecurity101, user_id: users.empPatricia2, rating: 4, comment: "Solid training on malicious URL payloads and indicators of compromise.", created_at: ISODate("2026-04-12T16:10:00Z") },
  { course_id: courses.complianceCrisis, user_id: users.empTeresa2, rating: 5, comment: "Excellent triage frameworks. Knowing how to sequence alerts under pressure was invaluable.", created_at: ISODate("2026-02-14T11:00:00Z") },
  { course_id: courses.complianceCrisis, user_id: users.mgrInes, rating: 4, comment: "Well-drafted disaster reporting playbooks. Great focus on maintaining single points of contact.", created_at: ISODate("2026-02-15T15:35:00Z") },
  { course_id: courses.communicationMastery, user_id: users.empJoao, rating: 5, comment: "Changed how I approach critical architectural review alignment with remote peers.", created_at: ISODate("2026-05-01T10:30:00Z") },
  { course_id: courses.communicationMastery, user_id: users.empSofia, rating: 4, comment: "Loved the radical candor frameworks for addressing recurring workflow delays.", created_at: ISODate("2026-05-03T11:20:00Z") },
  { course_id: courses.aiForTeams, user_id: users.empRita, rating: 5, comment: "Phenomenal guidelines on data masking before passing telemetry context into LLMs.", created_at: ISODate("2026-04-22T14:50:00Z") },
  { course_id: courses.aiForTeams, user_id: users.empLuis, rating: 4, comment: "Very useful examples for optimizing our support ticket automation pipeline without losing context.", created_at: ISODate("2026-04-25T09:12:00Z") },
  { course_id: courses.onboardingFastTrack, user_id: users.empMiguel, rating: 5, comment: "Everything a newcomer needs to know about our tooling permissions and internal wiki setups.", created_at: ISODate("2026-05-18T08:30:00Z") },
  { course_id: courses.onboardingFastTrack, user_id: users.empEva, rating: 4, comment: "Smooth introduction to the engineering branch guidelines and cross-functional expectations.", created_at: ISODate("2026-05-19T13:40:00Z") },
  { course_id: courses.workplaceSecurity, user_id: users.empRita, rating: 5, comment: "Crucial refresher on physical and digital security. Highly recommended for remote employees.", created_at: ISODate("2026-02-20T14:15:00Z") },
  { course_id: courses.cybersecurity101, user_id: users.empLuis, rating: 5, comment: "The phishing simulator and secure engineering examples were excellent. Hands-on and super practical.", created_at: ISODate("2026-03-02T09:00:00Z") },
  { course_id: courses.cybersecurity101, user_id: users.empSofia, rating: 4, comment: "Great foundational coding tips to prevent basic exploits. Wish it went slightly deeper into architecture.", created_at: ISODate("2026-03-05T16:45:00Z") },
  { course_id: courses.complianceCrisis, user_id: users.mgrMarta, rating: 5, comment: "The live playbooks and high-pressure practice incidents were intense but highly effective.", created_at: ISODate("2026-01-10T11:20:00Z") },
  { course_id: courses.complianceCrisis, user_id: users.mgrSergio, rating: 4, comment: "Clear structure and great incident response communication workflows. A bit short but to the point.", created_at: ISODate("2026-01-11T15:30:00Z") },
  { course_id: courses.communicationMastery, user_id: users.empMiguel, rating: 4, comment: "Useful frameworks for structured feedback loops. The hybrid breakdown worked out well.", created_at: ISODate("2026-04-12T10:00:00Z") },
  { course_id: courses.aiForTeams, user_id: users.empEva, rating: 5, comment: "Saved me hours of tedious work this week. Loved the structured frameworks for crafting practical prompts.", created_at: ISODate("2026-03-22T17:10:00Z") },
  { course_id: courses.aiForTeams, user_id: users.empTomas, rating: 3, comment: "The prompt engineering tips were helpful, but some operations-focused use cases were a bit basic.", created_at: ISODate("2026-03-25T13:00:00Z") },
  { course_id: courses.onboardingFastTrack, user_id: users.empCarla, rating: 5, comment: "Gave me a phenomenal baseline knowledge of our company culture, standard tools, and workflow requirements.", created_at: ISODate("2026-05-02T08:45:00Z") },
  { course_id: courses.advancedCloudArchitecture, user_id: users.empBruno, rating: 5, comment: "Incredibly deep technical drilldown into multi-region high availability setups. Exemplary engineering instruction.", created_at: ISODate("2026-04-18T16:00:00Z") },
  { course_id: courses.pythonForDataAnalysis, user_id: users.empMafalda, rating: 4, comment: "Pandas vectorization techniques covered here changed how I build my analysis notebooks. Great pace.", created_at: ISODate("2026-02-28T11:00:00Z") },
  { course_id: courses.antiBriberyAndCorruption, user_id: users.empNuno, rating: 4, comment: "Very comprehensive legal frameworks, though the case studies could be updated.", created_at: ISODate("2026-02-18T11:20:00Z") },
  { course_id: courses.executiveLeadershipStrategy, user_id: users.mgrInes, rating: 5, comment: "An excellent roadmap planning matrix. Crucial frameworks for long-term operational steering.", created_at: ISODate("2026-04-05T09:15:00Z") },
  { course_id: courses.introductionToAgileMethodology, user_id: users.empHelena, rating: 5, comment: "Crystal clear breakdown of Scrum artifacts and Kanban WIP limits. Perfect for our new workflows.", created_at: ISODate("2026-03-12T14:40:00Z") },
  { course_id: courses.gdprDataPrivacyStandards, user_id: users.empTiago, rating: 4, comment: "Necessary regulatory overview. Well structured to differentiate processor vs controller responsibilities.", created_at: ISODate("2026-01-22T10:05:00Z") },
  { course_id: courses.maConfidentialProcedures, user_id: users.mgrPaulo, rating: 5, comment: "Strict, actionable guidelines for handling highly sensitive corporate transaction data.", created_at: ISODate("2026-05-11T16:30:00Z") },
  { course_id: courses.healthAndSafetyBasics, user_id: users.empLea, rating: 3, comment: "Standard compliance checklist. Covers basic OSHA rules but can get a bit repetitive.", created_at: ISODate("2026-02-10T11:12:00Z") },
  { course_id: courses.implicitBiasAwareness, user_id: users.mgrMario, rating: 5, comment: "Incredibly eye-opening exercises for identifying unconscious filters during resume screening.", created_at: ISODate("2026-03-19T09:50:00Z") },
  { course_id: courses.blockchainInSupplyChain, user_id: users.empBianca, rating: 4, comment: "Good practical exploration of distributed ledgers. Very insightful tracking architecture.", created_at: ISODate("2026-04-26T15:22:00Z") },
  { course_id: courses.conflictResolutionForManagers, user_id: users.mgrMarta, rating: 5, comment: "Essential roleplay loops for active mediation. Gave me immediate tools for my next 1-on-1s.", created_at: ISODate("2026-02-05T14:10:00Z") },
  { course_id: courses.annualItSecurityRefresh, user_id: users.empAndre, rating: 4, comment: "Quick and vital refresh on modern multi-factor bypass attempts and spear-phishing cues.", created_at: ISODate("2026-05-14T08:30:00Z") },
  { course_id: courses.machineLearningFundamentals, user_id: users.empPatricia, rating: 5, comment: "Superb foundational breakdown of gradient descent and bias-variance tradeoffs.", created_at: ISODate("2026-03-30T17:05:00Z") },
  { course_id: courses.publicSpeakingForTechies, user_id: users.empGoncalo, rating: 4, comment: "Extremely helpful structural templates for translating system complexity into business value.", created_at: ISODate("2026-04-02T11:45:00Z") },
  { course_id: courses.financialInsiderTradingPolicy, user_id: users.empRaquel, rating: 5, comment: "Very precise boundaries mapped out regarding blackout periods and material non-public info.", created_at: ISODate("2026-01-15T09:00:00Z") },
  { course_id: courses.uxUiDesignSystems, user_id: users.empVasco, rating: 5, comment: "Figma component tokenization masterclass. Greatly improved our engineering handoff workflows.", created_at: ISODate("2026-04-14T16:18:00Z") },
  { course_id: courses.effectiveTimeManagement, user_id: users.empTeresa, rating: 4, comment: "Practical productivity blocks. Time-boxing techniques and priority matrix methods were great.", created_at: ISODate("2026-03-08T10:00:00Z") },
  { course_id: courses.corporateEthicsIntegrity, user_id: users.empDiogo, rating: 4, comment: "Good compliance scenario breakdowns. Addresses grey areas in vendor relationships very well.", created_at: ISODate("2026-02-25T13:55:00Z") },
  { course_id: courses.advancedReactPatterns, user_id: users.empLuis2, rating: 5, comment: "Deeply informative session on compound components, custom state reducers, and hydration tuning.", created_at: ISODate("2026-05-08T15:40:00Z") },
  { course_id: courses.emotionalIntelligenceAtWork, user_id: users.empNuno2, rating: 5, comment: "Excellent self-reflection frameworks. Boosted my empathy mapping and active team communication.", created_at: ISODate("2026-04-20T11:30:00Z") },
  { course_id: courses.whistleblowerTraining, user_id: users.empDiogo2, rating: 4, comment: "Very clear structural outline of anonymous reporting channels and retaliation protections.", created_at: ISODate("2026-01-30T14:00:00Z") },
  { course_id: courses.highPerformanceComputing, user_id: users.empMiguel2, rating: 5, comment: "Fantastic technical breakdown of CUDA kernels and shared memory bank conflicts. Highly complex.", created_at: ISODate("2026-05-02T16:45:00Z") }
]);

// Fetch all courses from the database
var allCourses = db.courses.find().toArray();
var newSessions = [];

var trainingSessionDocs = [];

// id: 4 — Advanced Cloud Architecture | online | start: 2026-04-18T09:00
trainingSessionDocs.push({
  course_id: courses.advancedCloudArchitecture,
  date: ISODate("2026-04-18T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.advancedCloudArchitecture,
  date: ISODate("2026-04-25T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 5 — Anti-Bribery and Corruption | in_person | London | start: 2026-03-12T11:00
trainingSessionDocs.push({
  course_id: courses.antiBriberyAndCorruption,
  date: ISODate("2026-03-12T11:00:00Z"),
  duration_minutes: 90,
  location: "London - Conference Centre A"
});

// id: 6 — Executive Leadership Strategy | in_person | Paris | start: 2026-07-05T10:00
trainingSessionDocs.push({
  course_id: courses.executiveLeadershipStrategy,
  date: ISODate("2026-07-05T10:00:00Z"),
  duration_minutes: 180,
  location: "Paris - Executive Hub"
});
trainingSessionDocs.push({
  course_id: courses.executiveLeadershipStrategy,
  date: ISODate("2026-07-12T10:00:00Z"),
  duration_minutes: 180,
  location: "Paris - Executive Hub"
});

// id: 7 — Introduction to Agile Methodology | online | start: 2026-01-15T14:00
trainingSessionDocs.push({
  course_id: courses.introductionToAgileMethodology,
  date: ISODate("2026-01-15T14:00:00Z"),
  duration_minutes: 90,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.introductionToAgileMethodology,
  date: ISODate("2026-01-22T14:00:00Z"),
  duration_minutes: 90,
  location: "Online - Meet"
});

// id: 8 — GDPR Data Privacy Standards | hybrid | Perth | start: 2026-08-10T09:30
trainingSessionDocs.push({
  course_id: courses.gdprDataPrivacyStandards,
  date: ISODate("2026-08-10T09:30:00Z"),
  duration_minutes: 120,
  location: "Perth - Training Room 2 / Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.gdprDataPrivacyStandards,
  date: ISODate("2026-08-17T09:30:00Z"),
  duration_minutes: 120,
  location: "Perth - Training Room 2 / Online - Teams"
});

// id: 9 — M&A Confidential Procedures | in_person | New York | start: 2026-05-25T13:00
trainingSessionDocs.push({
  course_id: courses.maConfidentialProcedures,
  date: ISODate("2026-05-25T13:00:00Z"),
  duration_minutes: 150,
  location: "New York - Board Room 1"
});

// id: 10 — Health and Safety Basics | online | start: 2026-02-20T08:00
trainingSessionDocs.push({
  course_id: courses.healthAndSafetyBasics,
  date: ISODate("2026-02-20T08:00:00Z"),
  duration_minutes: 60,
  location: "Online - Meet"
});

// id: 11 — Python for Data Analysis | online | start: 2026-09-12T10:00
trainingSessionDocs.push({
  course_id: courses.pythonForDataAnalysis,
  date: ISODate("2026-09-12T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.pythonForDataAnalysis,
  date: ISODate("2026-09-19T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 12 — Implicit Bias Awareness | hybrid | Perth | start: 2026-04-05T13:00
trainingSessionDocs.push({
  course_id: courses.implicitBiasAwareness,
  date: ISODate("2026-04-05T13:00:00Z"),
  duration_minutes: 90,
  location: "Perth - Room Horizon / Online - Teams"
});

// id: 13 — Blockchain in Supply Chain | online | start: 2026-11-03T09:30
trainingSessionDocs.push({
  course_id: courses.blockchainInSupplyChain,
  date: ISODate("2026-11-03T09:30:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.blockchainInSupplyChain,
  date: ISODate("2026-11-10T09:30:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 14 — Conflict Resolution for Managers | in_person | Dublin | start: 2026-05-14T11:00
trainingSessionDocs.push({
  course_id: courses.conflictResolutionForManagers,
  date: ISODate("2026-05-14T11:00:00Z"),
  duration_minutes: 120,
  location: "Dublin - Meeting Room B"
});

// id: 15 — Annual IT Security Refresh | in_person | Braga | start: 2026-01-20T10:00
trainingSessionDocs.push({
  course_id: courses.annualItSecurityRefresh,
  date: ISODate("2026-01-20T10:00:00Z"),
  duration_minutes: 60,
  location: "Braga - Auditorium"
});

// id: 16 — Machine Learning Fundamentals | online | start: 2026-06-08T15:00
trainingSessionDocs.push({
  course_id: courses.machineLearningFundamentals,
  date: ISODate("2026-06-08T15:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.machineLearningFundamentals,
  date: ISODate("2026-06-15T15:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 17 — Public Speaking for Techies | hybrid | Perth | start: 2026-07-22T14:00
trainingSessionDocs.push({
  course_id: courses.publicSpeakingForTechies,
  date: ISODate("2026-07-22T14:00:00Z"),
  duration_minutes: 90,
  location: "Perth - Room Zenith / Online - Teams"
});

// id: 18 — Financial Insider Trading Policy | in_person | New York | start: 2026-08-30T10:30
trainingSessionDocs.push({
  course_id: courses.financialInsiderTradingPolicy,
  date: ISODate("2026-08-30T10:30:00Z"),
  duration_minutes: 90,
  location: "New York - Compliance Room 2"
});

// id: 19 — UX/UI Design Systems | online | start: 2026-03-11T13:00
trainingSessionDocs.push({
  course_id: courses.uxUiDesignSystems,
  date: ISODate("2026-03-11T13:00:00Z"),
  duration_minutes: 90,
  location: "Online - Meet"
});

// id: 20 — Effective Time Management | in_person | Braga | start: 2026-02-28T09:00
trainingSessionDocs.push({
  course_id: courses.effectiveTimeManagement,
  date: ISODate("2026-02-28T09:00:00Z"),
  duration_minutes: 90,
  location: "Braga - Training Room 1"
});

// id: 21 — Corporate Ethics & Integrity | hybrid | Barcelona | start: 2026-01-10T11:00
trainingSessionDocs.push({
  course_id: courses.corporateEthicsIntegrity,
  date: ISODate("2026-01-10T11:00:00Z"),
  duration_minutes: 90,
  location: "Barcelona - Room Nova / Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.corporateEthicsIntegrity,
  date: ISODate("2026-01-17T11:00:00Z"),
  duration_minutes: 90,
  location: "Barcelona - Room Nova / Online - Teams"
});

// id: 22 — Advanced React Patterns | online | start: 2026-05-19T16:00
trainingSessionDocs.push({
  course_id: courses.advancedReactPatterns,
  date: ISODate("2026-05-19T16:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 23 — Emotional Intelligence at Work | in_person | Paris | start: 2026-04-20T09:30
trainingSessionDocs.push({
  course_id: courses.emotionalIntelligenceAtWork,
  date: ISODate("2026-04-20T09:30:00Z"),
  duration_minutes: 90,
  location: "Paris - Room Lumière"
});

// id: 24 — Whistleblower Training | in_person | London | start: 2026-06-01T10:00
trainingSessionDocs.push({
  course_id: courses.whistleblowerTraining,
  date: ISODate("2026-06-01T10:00:00Z"),
  duration_minutes: 60,
  location: "London - Compliance Hall"
});

// id: 25 — High-Performance Computing | online | start: 2026-08-14T09:00
trainingSessionDocs.push({
  course_id: courses.highPerformanceComputing,
  date: ISODate("2026-08-14T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.highPerformanceComputing,
  date: ISODate("2026-08-21T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 26 — Customer Support Excellence | in_person | Manila | start: 2026-03-05T08:00
trainingSessionDocs.push({
  course_id: courses.customerSupportExcellence,
  date: ISODate("2026-03-05T08:00:00Z"),
  duration_minutes: 120,
  location: "Manila - Training Centre"
});

// id: 27 — Sexual Harassment Prevention | hybrid | Barcelona | start: 2026-02-15T13:00
trainingSessionDocs.push({
  course_id: courses.sexualHarassmentPrevention,
  date: ISODate("2026-02-15T13:00:00Z"),
  duration_minutes: 90,
  location: "Barcelona - Room Gaudí / Online - Teams"
});

// id: 28 — Kubernetes for Operators | online | start: 2026-07-10T14:00
trainingSessionDocs.push({
  course_id: courses.kubernetesForOperators,
  date: ISODate("2026-07-10T14:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.kubernetesForOperators,
  date: ISODate("2026-07-17T14:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 29 — Negotiation Skills for Sales | in_person | Amsterdam | start: 2026-10-12T11:00
trainingSessionDocs.push({
  course_id: courses.negotiationSkillsForSales,
  date: ISODate("2026-10-12T11:00:00Z"),
  duration_minutes: 120,
  location: "Amsterdam - Room Rembrandt"
});

// id: 30 — Environmental Sustainability | in_person | Nice | start: 2026-09-01T15:00
trainingSessionDocs.push({
  course_id: courses.environmentalSustainability,
  date: ISODate("2026-09-01T15:00:00Z"),
  duration_minutes: 60,
  location: "Nice - Conference Room Azur"
});

// id: 31 — Deep Learning with PyTorch | online | start: 2026-12-05T09:00
trainingSessionDocs.push({
  course_id: courses.deepLearningWithPyTorch,
  date: ISODate("2026-12-05T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.deepLearningWithPyTorch,
  date: ISODate("2026-12-12T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 32 — Business Travel Policy | hybrid | Barcelona | start: 2026-01-25T14:00
trainingSessionDocs.push({
  course_id: courses.businessTravelPolicy,
  date: ISODate("2026-01-25T14:00:00Z"),
  duration_minutes: 60,
  location: "Barcelona - Room Sagrada / Online - Teams"
});

// id: 33 — Mentorship Program Kickoff | in_person | Dublin | start: 2026-03-20T16:00
trainingSessionDocs.push({
  course_id: courses.mentorshipProgramKickoff,
  date: ISODate("2026-03-20T16:00:00Z"),
  duration_minutes: 90,
  location: "Dublin - Meeting Room A"
});

// id: 34 — Cyber Resilience Strategy | online | start: 2026-06-15T10:30
trainingSessionDocs.push({
  course_id: courses.cyberResilienceStrategy,
  date: ISODate("2026-06-15T10:30:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 35 — Diversity in the Workplace | hybrid | Bangkok | start: 2026-05-20T09:00
trainingSessionDocs.push({
  course_id: courses.diversityInTheWorkplace,
  date: ISODate("2026-05-20T09:00:00Z"),
  duration_minutes: 90,
  location: "Bangkok - Room Lotus / Online - Teams"
});

// id: 36 — Effective Remote Work | in_person | Nice | start: 2026-04-10T13:00
trainingSessionDocs.push({
  course_id: courses.effectiveRemoteWork,
  date: ISODate("2026-04-10T13:00:00Z"),
  duration_minutes: 90,
  location: "Nice - Training Room Côte"
});

// id: 37 — SQL Advanced Querying | online | start: 2026-08-01T11:00
trainingSessionDocs.push({
  course_id: courses.sqlAdvancedQuerying,
  date: ISODate("2026-08-01T11:00:00Z"),
  duration_minutes: 90,
  location: "Online - Meet"
});

// id: 38 — Workplace Violence Awareness | hybrid | Bangkok | start: 2026-07-05T10:00
trainingSessionDocs.push({
  course_id: courses.workplaceViolenceAwareness,
  date: ISODate("2026-07-05T10:00:00Z"),
  duration_minutes: 60,
  location: "Bangkok - Room Orchid / Online - Teams"
});

// id: 39 — Enterprise SEO Basics | online | start: 2026-02-12T09:30
trainingSessionDocs.push({
  course_id: courses.enterpriseSeoBasics,
  date: ISODate("2026-02-12T09:30:00Z"),
  duration_minutes: 90,
  location: "Online - Meet"
});

// id: 40 — Strategic Thinking for VPs | in_person | Paris | start: 2026-11-18T14:00
trainingSessionDocs.push({
  course_id: courses.strategicThinkingForVPs,
  date: ISODate("2026-11-18T14:00:00Z"),
  duration_minutes: 180,
  location: "Paris - Executive Suite"
});
trainingSessionDocs.push({
  course_id: courses.strategicThinkingForVPs,
  date: ISODate("2026-11-25T14:00:00Z"),
  duration_minutes: 180,
  location: "Paris - Executive Suite"
});

// id: 41 — IT Service Management (ITIL) | online | start: 2026-03-30T10:00
trainingSessionDocs.push({
  course_id: courses.itServiceManagementItil,
  date: ISODate("2026-03-30T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 42 — Natural Language Processing | in_person | San Jose | start: 2026-10-05T15:00
trainingSessionDocs.push({
  course_id: courses.naturalLanguageProcessing,
  date: ISODate("2026-10-05T15:00:00Z"),
  duration_minutes: 120,
  location: "San Jose - Room Silicon"
});

// id: 43 — Active Listener Training | in_person | Berlin | start: 2026-06-12T13:00
trainingSessionDocs.push({
  course_id: courses.activeListenerTraining,
  date: ISODate("2026-06-12T13:00:00Z"),
  duration_minutes: 90,
  location: "Berlin - Room Brandenburg"
});

// id: 44 — Global Export Controls | in_person | Washington D.C. | start: 2026-09-22T11:00
trainingSessionDocs.push({
  course_id: courses.globalExportControls,
  date: ISODate("2026-09-22T11:00:00Z"),
  duration_minutes: 120,
  location: "Washington D.C. - Policy Room 1"
});

// id: 45 — Microservices with Go | online | start: 2026-04-28T10:00
trainingSessionDocs.push({
  course_id: courses.microservicesWithGo,
  date: ISODate("2026-04-28T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.microservicesWithGo,
  date: ISODate("2026-05-05T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 46 — Marketing Analytics ROI | in_person | London | start: 2026-01-18T14:30
trainingSessionDocs.push({
  course_id: courses.marketingAnalyticsRoi,
  date: ISODate("2026-01-18T14:30:00Z"),
  duration_minutes: 90,
  location: "London - Room Canary"
});

// id: 47 — Onboarding for New Managers | hybrid | Bangkok | start: 2026-05-15T09:00
trainingSessionDocs.push({
  course_id: courses.onboardingForNewManagers,
  date: ISODate("2026-05-15T09:00:00Z"),
  duration_minutes: 120,
  location: "Bangkok - Room Jasmine / Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.onboardingForNewManagers,
  date: ISODate("2026-05-22T09:00:00Z"),
  duration_minutes: 120,
  location: "Bangkok - Room Jasmine / Online - Teams"
});

// id: 48 — Legal Patent Filing 101 | hybrid | Oxford | start: 2026-07-20T15:30
trainingSessionDocs.push({
  course_id: courses.legalPatentFiling101,
  date: ISODate("2026-07-20T15:30:00Z"),
  duration_minutes: 90,
  location: "Oxford - Room Bodleian / Online - Teams"
});

// id: 49 — Cloud Security Best Practices | online | start: 2026-08-11T10:00
trainingSessionDocs.push({
  course_id: courses.cloudSecurityBestPractices,
  date: ISODate("2026-08-11T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 50 — Fire Safety and Prevention | hybrid | Oxford | start: 2026-02-10T14:00
trainingSessionDocs.push({
  course_id: courses.fireSafetyAndPrevention,
  date: ISODate("2026-02-10T14:00:00Z"),
  duration_minutes: 60,
  location: "Oxford - Main Hall / Online - Teams"
});

// id: 51 — Terraform Infrastructure as Code | online | start: 2026-11-01T13:00
trainingSessionDocs.push({
  course_id: courses.terraformInfrastructureAsCode,
  date: ISODate("2026-11-01T13:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.terraformInfrastructureAsCode,
  date: ISODate("2026-11-08T13:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 52 — Agile Product Management | in_person | Barcelona | start: 2026-06-18T09:30
trainingSessionDocs.push({
  course_id: courses.agileProductManagement,
  date: ISODate("2026-06-18T09:30:00Z"),
  duration_minutes: 120,
  location: "Barcelona - Room Picasso"
});

// id: 53 — Workplace Wellness | hybrid | Oxford | start: 2026-04-30T11:00
trainingSessionDocs.push({
  course_id: courses.workplaceWellness,
  date: ISODate("2026-04-30T11:00:00Z"),
  duration_minutes: 60,
  location: "Oxford - Wellness Room / Online - Teams"
});

// id: 54 — DevSecOps Integration | in_person | Paris | start: 2026-09-14T10:30
trainingSessionDocs.push({
  course_id: courses.devSecOpsIntegration,
  date: ISODate("2026-09-14T10:30:00Z"),
  duration_minutes: 120,
  location: "Paris - Tech Hub Room"
});
trainingSessionDocs.push({
  course_id: courses.devSecOpsIntegration,
  date: ISODate("2026-09-21T10:30:00Z"),
  duration_minutes: 120,
  location: "Paris - Tech Hub Room"
});

// id: 55 — Change Management Frameworks | hybrid | Porto | start: 2026-12-10T14:00
trainingSessionDocs.push({
  course_id: courses.changeManagementFrameworks,
  date: ISODate("2026-12-10T14:00:00Z"),
  duration_minutes: 90,
  location: "Porto - Room Douro / Online - Teams"
});

// id: 56 — HIPAA Data Compliance | online | start: 2026-03-22T09:00
trainingSessionDocs.push({
  course_id: courses.hipaaDataCompliance,
  date: ISODate("2026-03-22T09:00:00Z"),
  duration_minutes: 90,
  location: "Online - Teams"
});

// id: 57 — Quantum Computing Intro | online | start: 2026-05-05T15:00
trainingSessionDocs.push({
  course_id: courses.quantumComputingIntro,
  date: ISODate("2026-05-05T15:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 58 — Scrum Master Certification | in_person | London | start: 2026-08-25T10:00
trainingSessionDocs.push({
  course_id: courses.scrumMasterCertification,
  date: ISODate("2026-08-25T10:00:00Z"),
  duration_minutes: 120,
  location: "London - Room Thames"
});
trainingSessionDocs.push({
  course_id: courses.scrumMasterCertification,
  date: ISODate("2026-09-01T10:00:00Z"),
  duration_minutes: 120,
  location: "London - Room Thames"
});

// id: 59 — Employee Rights & Labor Laws | in_person | Madrid | start: 2026-10-15T13:00
trainingSessionDocs.push({
  course_id: courses.employeeRightsLaborLaws,
  date: ISODate("2026-10-15T13:00:00Z"),
  duration_minutes: 90,
  location: "Madrid - Compliance Room 3"
});

// id: 60 — Kubernetes Advanced Networking | online | start: 2026-04-12T11:00
trainingSessionDocs.push({
  course_id: courses.kubernetesAdvancedNetworking,
  date: ISODate("2026-04-12T11:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.kubernetesAdvancedNetworking,
  date: ISODate("2026-04-19T11:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 61 — Customer Feedback Loop | in_person | Berlin | start: 2026-07-30T15:00
trainingSessionDocs.push({
  course_id: courses.customerFeedbackLoop,
  date: ISODate("2026-07-30T15:00:00Z"),
  duration_minutes: 90,
  location: "Berlin - Room Tiergarten"
});

// id: 62 — Annual Policy Review 2026 | hybrid | Porto | start: 2026-01-05T09:00
trainingSessionDocs.push({
  course_id: courses.annualPolicyReview2026,
  date: ISODate("2026-01-05T09:00:00Z"),
  duration_minutes: 60,
  location: "Porto - Auditorium / Online - Teams"
});

// id: 63 — Rust for Systems Programming | online | start: 2026-02-28T14:00
trainingSessionDocs.push({
  course_id: courses.rustForSystemsProgramming,
  date: ISODate("2026-02-28T14:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.rustForSystemsProgramming,
  date: ISODate("2026-03-07T14:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 64 — Public Speaking: Keynotes | in_person | San Francisco | start: 2026-09-10T10:30
trainingSessionDocs.push({
  course_id: courses.publicSpeakingKeynotes,
  date: ISODate("2026-09-10T10:30:00Z"),
  duration_minutes: 120,
  location: "San Francisco - Stage Room 1"
});

// id: 65 — Anti-Harassment Training | hybrid | Porto | start: 2026-05-20T13:00
trainingSessionDocs.push({
  course_id: courses.antiHarassmentTraining,
  date: ISODate("2026-05-20T13:00:00Z"),
  duration_minutes: 90,
  location: "Porto - Room Ribeira / Online - Teams"
});

// id: 66 — Executive Presenting Skills | in_person | New York | start: 2026-11-12T11:00
trainingSessionDocs.push({
  course_id: courses.executivePresentingSkills,
  date: ISODate("2026-11-12T11:00:00Z"),
  duration_minutes: 150,
  location: "New York - Boardroom 4"
});

// id: 67 — GraphQL API Design | online | start: 2026-03-08T15:30
trainingSessionDocs.push({
  course_id: courses.graphqlApiDesign,
  date: ISODate("2026-03-08T15:30:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 68 — Corporate Tax Laws | in_person | London | start: 2026-06-25T09:30
trainingSessionDocs.push({
  course_id: courses.corporateTaxLaws,
  date: ISODate("2026-06-25T09:30:00Z"),
  duration_minutes: 150,
  location: "London - Room Westminster"
});
trainingSessionDocs.push({
  course_id: courses.corporateTaxLaws,
  date: ISODate("2026-07-02T09:30:00Z"),
  duration_minutes: 150,
  location: "London - Room Westminster"
});

// id: 69 — Zero Trust Security Architect | hybrid | Chicago | start: 2026-04-14T14:00
trainingSessionDocs.push({
  course_id: courses.zeroTrustSecurityArchitect,
  date: ISODate("2026-04-14T14:00:00Z"),
  duration_minutes: 120,
  location: "Chicago - Room Midway / Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.zeroTrustSecurityArchitect,
  date: ISODate("2026-04-21T14:00:00Z"),
  duration_minutes: 120,
  location: "Chicago - Room Midway / Online - Teams"
});

// id: 70 — Storytelling for Sales | in_person | Austin | start: 2026-02-18T10:00
trainingSessionDocs.push({
  course_id: courses.storytellingForSales,
  date: ISODate("2026-02-18T10:00:00Z"),
  duration_minutes: 90,
  location: "Austin - Room Lone Star"
});

// id: 71 — Hazardous Materials Handling | in_person | Chicago | start: 2026-10-10T09:00
trainingSessionDocs.push({
  course_id: courses.hazardousMaterialsHandling,
  date: ISODate("2026-10-10T09:00:00Z"),
  duration_minutes: 120,
  location: "Chicago - Lab Safety Room"
});

// id: 72 — AI Model Fine-Tuning | hybrid | Lisbon | start: 2026-08-22T13:30
trainingSessionDocs.push({
  course_id: courses.aiModelFineTuning,
  date: ISODate("2026-08-22T13:30:00Z"),
  duration_minutes: 120,
  location: "Lisbon - Room Tejo / Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.aiModelFineTuning,
  date: ISODate("2026-08-29T13:30:00Z"),
  duration_minutes: 120,
  location: "Lisbon - Room Tejo / Online - Teams"
});

// id: 73 — Project Management Foundations | online | start: 2026-12-01T11:00
trainingSessionDocs.push({
  course_id: courses.projectManagementFoundations,
  date: ISODate("2026-12-01T11:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 74 — Data Privacy for Engineers | in_person | Berlin | start: 2026-05-30T10:00
trainingSessionDocs.push({
  course_id: courses.dataPrivacyForEngineers,
  date: ISODate("2026-05-30T10:00:00Z"),
  duration_minutes: 120,
  location: "Berlin - Room Spree"
});

// id: 75 — Search Engine Algorithms | in_person | Mountain View | start: 2026-11-15T15:00
trainingSessionDocs.push({
  course_id: courses.searchEngineAlgorithms,
  date: ISODate("2026-11-15T15:00:00Z"),
  duration_minutes: 150,
  location: "Mountain View - Tech Auditorium"
});
trainingSessionDocs.push({
  course_id: courses.searchEngineAlgorithms,
  date: ISODate("2026-11-22T15:00:00Z"),
  duration_minutes: 150,
  location: "Mountain View - Tech Auditorium"
});

// id: 76 — Personal Finance for Employees | in_person | Rio de Janeiro | start: 2026-01-15T14:00
trainingSessionDocs.push({
  course_id: courses.personalFinanceForEmployees,
  date: ISODate("2026-01-15T14:00:00Z"),
  duration_minutes: 60,
  location: "Rio de Janeiro - Room Ipanema"
});

// id: 77 — Insider Threat Mitigation | hybrid | Melbourne | start: 2026-07-12T09:30
trainingSessionDocs.push({
  course_id: courses.insiderThreatMitigation,
  date: ISODate("2026-07-12T09:30:00Z"),
  duration_minutes: 90,
  location: "Melbourne - Room Yarra / Online - Teams"
});

// id: 78 — FPGA Programming | online | start: 2026-03-25T08:00
trainingSessionDocs.push({
  course_id: courses.fpgaProgramming,
  date: ISODate("2026-03-25T08:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.fpgaProgramming,
  date: ISODate("2026-04-01T08:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 79 — Leadership 360 Feedback | in_person | London | start: 2026-09-18T16:00
trainingSessionDocs.push({
  course_id: courses.leadership360Feedback,
  date: ISODate("2026-09-18T16:00:00Z"),
  duration_minutes: 90,
  location: "London - Room Hyde"
});

// id: 80 — Ethical Hacking Intro | online | start: 2026-06-05T10:00
trainingSessionDocs.push({
  course_id: courses.ethicalHackingIntro,
  date: ISODate("2026-06-05T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.ethicalHackingIntro,
  date: ISODate("2026-06-12T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 81 — Brand Guidelines 2026 | hybrid | Sydney | start: 2026-02-01T13:30
trainingSessionDocs.push({
  course_id: courses.brandGuidelines2026,
  date: ISODate("2026-02-01T13:30:00Z"),
  duration_minutes: 60,
  location: "Sydney - Room Harbour / Online - Teams"
});

// id: 82 — Big Data with Spark | online | start: 2026-10-22T09:00
trainingSessionDocs.push({
  course_id: courses.bigDataWithSpark,
  date: ISODate("2026-10-22T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});
trainingSessionDocs.push({
  course_id: courses.bigDataWithSpark,
  date: ISODate("2026-10-29T09:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 83 — Influencing Without Authority | in_person | Paris | start: 2026-04-02T14:00
trainingSessionDocs.push({
  course_id: courses.influencingWithoutAuthority,
  date: ISODate("2026-04-02T14:00:00Z"),
  duration_minutes: 120,
  location: "Paris - Room Eiffel"
});

// id: 84 — Workplace Safety for Remote Workers | in_person | Sydney | start: 2026-08-15T11:00
trainingSessionDocs.push({
  course_id: courses.workplaceSafetyForRemoteWorkers,
  date: ISODate("2026-08-15T11:00:00Z"),
  duration_minutes: 60,
  location: "Sydney - Room Bondi"
});

// id: 85 — Advanced Cryptography | online | start: 2026-11-30T10:00
trainingSessionDocs.push({
  course_id: courses.advancedCryptography,
  date: ISODate("2026-11-30T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.advancedCryptography,
  date: ISODate("2026-12-07T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 86 — Content Marketing Strategy | in_person | Austin | start: 2026-01-22T09:30
trainingSessionDocs.push({
  course_id: courses.contentMarketingStrategy,
  date: ISODate("2026-01-22T09:30:00Z"),
  duration_minutes: 120,
  location: "Austin - Room Congress"
});

// id: 87 — Equal Opportunity Employment | hybrid | Madrid | start: 2026-03-12T15:00
trainingSessionDocs.push({
  course_id: courses.equalOpportunityEmployment,
  date: ISODate("2026-03-12T15:00:00Z"),
  duration_minutes: 90,
  location: "Madrid - Room Sol / Online - Teams"
});

// id: 88 — Web Assembly (WASM) Intro | online | start: 2026-05-18T11:00
trainingSessionDocs.push({
  course_id: courses.webAssemblyWasmIntro,
  date: ISODate("2026-05-18T11:00:00Z"),
  duration_minutes: 120,
  location: "Online - Meet"
});

// id: 89 — Customer Success Foundations | in_person | Madrid | start: 2026-07-08T14:30
trainingSessionDocs.push({
  course_id: courses.customerSuccessFoundations,
  date: ISODate("2026-07-08T14:30:00Z"),
  duration_minutes: 120,
  location: "Madrid - Room Gran Via"
});

// id: 90 — Cyber Espionage Defense | in_person | Washington D.C. | start: 2026-09-05T09:00
trainingSessionDocs.push({
  course_id: courses.cyberEspionageDefense,
  date: ISODate("2026-09-05T09:00:00Z"),
  duration_minutes: 150,
  location: "Washington D.C. - Secure Room 1"
});
trainingSessionDocs.push({
  course_id: courses.cyberEspionageDefense,
  date: ISODate("2026-09-12T09:00:00Z"),
  duration_minutes: 150,
  location: "Washington D.C. - Secure Room 1"
});

// id: 91 — Unconscious Bias in Performance Reviews | hybrid | Brussels | start: 2026-10-30T13:00
trainingSessionDocs.push({
  course_id: courses.unconsciousBiasInPerformanceReviews,
  date: ISODate("2026-10-30T13:00:00Z"),
  duration_minutes: 90,
  location: "Brussels - Room Atomium / Online - Teams"
});

// id: 92 — Site Reliability Engineering | online | start: 2026-02-14T10:00
trainingSessionDocs.push({
  course_id: courses.siteReliabilityEngineering,
  date: ISODate("2026-02-14T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});
trainingSessionDocs.push({
  course_id: courses.siteReliabilityEngineering,
  date: ISODate("2026-02-21T10:00:00Z"),
  duration_minutes: 120,
  location: "Online - Teams"
});

// id: 93 — Mobile App Accessibility | hybrid | Lisboa | start: 2026-06-22T15:00
trainingSessionDocs.push({
  course_id: courses.mobileAppAccessibility,
  date: ISODate("2026-06-22T15:00:00Z"),
  duration_minutes: 90,
  location: "Lisboa - Room Belém / Online - Teams"
});

// id: 94 — Social Media Policy | in_person | Berlin | start: 2026-01-10T10:00
trainingSessionDocs.push({
  course_id: courses.socialMediaPolicy,
  date: ISODate("2026-01-10T10:00:00Z"),
  duration_minutes: 60,
  location: "Berlin - Room Mitte"
});

db.sessions.insertMany(trainingSessionDocs);
/*
// Iterate through each course to check for existing sessions
allCourses.forEach(function(course) {
    var sessionCount = db.sessions.countDocuments({ course_id: course._id });
    
    // If the course has no sessions, prepare a new default session
    if (sessionCount === 0) {
        newSessions.push({
            _id: ObjectId(),
            course_id: course._id,
            date: new ISODate('2026-08-01T10:00:00Z'), // Placeholder date, can be adjusted
            duration_minutes: 120, // Default duration
            location: 'Online - TBD',
            description: 'Introductory session for ' + course.title
        });
    }
});

// Insert the new sessions into the database if there are any to add
if (newSessions.length > 0) {
    db.sessions.insertMany(newSessions);
    print("Successfully added " + newSessions.length + " new sessions for courses that had none.");
} else {
    print("All courses already have at least one session.");
}
    TODo check this
    */
