// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DiabetesAnalytics
 * @dev Anonymous diabetes patient statistical analysis contract - Simplified version
 * Supports encrypted blood glucose data upload and aggregated analysis (using simulated encryption)
 */
contract DiabetesAnalytics {
    // Event definitions
    event DataSubmitted(address indexed patient, string ipfsCid, uint256 timestamp);
    event AnalysisRequested(address indexed researcher, uint256 requestId);
    event AnalysisCompleted(uint256 indexed requestId, string resultCid);

    // Data structures
    struct PatientData {
        bytes encryptedBloodGlucose;  // Encrypted blood glucose data
        bytes encryptionProof;        // Encryption proof
        uint256 timestamp;            // Timestamp
        string ipfsCid;               // IPFS CID for original data storage
        string loincCode;             // LOINC code (2345-7 for glucose)
        bool isActive;                // Whether the data is valid
    }

    struct AnalysisRequest {
        address researcher;      // Researcher address
        uint256 timestamp;       // Request timestamp
        bool completed;          // Whether completed
        string resultCid;        // Result IPFS CID
        uint256 fee;             // Analysis fee
        uint8 analysisType;      // Analysis type
    }

    // State variables
    mapping(address => PatientData[]) public patientSubmissions;
    mapping(uint256 => AnalysisRequest) public analysisRequests;
    mapping(address => bool) public authorizedResearchers;

    address[] public allPatients;
    uint256 public nextRequestId;
    uint256 public totalSubmissions;
    uint256 public analysisFeeBasis = 0.001 ether; // Base analysis fee

    address public owner;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorizedResearcher() {
        require(authorizedResearchers[msg.sender], "Not authorized researcher");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextRequestId = 1;

        // Initialize some authorized researchers (example)
        authorizedResearchers[msg.sender] = true;
    }

    /**
     * @dev Patient submits encrypted blood glucose data
     * @param encryptedGlucose Encrypted blood glucose data
     * @param inputProof Encryption proof
     * @param ipfsCid IPFS CID for original data storage
     * @param loincCode LOINC code
     */
    function submitPatientData(
        bytes calldata encryptedGlucose,
        bytes calldata inputProof,
        string calldata ipfsCid,
        string calldata loincCode
    ) external {
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(encryptedGlucose.length > 0, "Encrypted data cannot be empty");

        // Store patient data
        PatientData memory newData = PatientData({
            encryptedBloodGlucose: encryptedGlucose,
            encryptionProof: inputProof,
            timestamp: block.timestamp,
            ipfsCid: ipfsCid,
            loincCode: loincCode,
            isActive: true
        });

        patientSubmissions[msg.sender].push(newData);

        // If new patient, add to patient list
        if (patientSubmissions[msg.sender].length == 1) {
            allPatients.push(msg.sender);
        }

        totalSubmissions++;

        emit DataSubmitted(msg.sender, ipfsCid, block.timestamp);
    }

    /**
     * @dev Researcher requests aggregated analysis
     * @param analysisType Analysis type (0: Descriptive statistics, 1: Univariate analysis, 2: Logistic regression, 3: Linear regression, 4: Stratified analysis, 5: Correlation analysis)
     */
    function requestAnalysis(uint8 analysisType) external payable onlyAuthorizedResearcher {
        require(msg.value >= analysisFeeBasis, "Insufficient fee for analysis");
        require(totalSubmissions > 0, "No data available for analysis");
        require(analysisType <= 5, "Invalid analysis type");

        uint256 requestId = nextRequestId++;

        analysisRequests[requestId] = AnalysisRequest({
            researcher: msg.sender,
            timestamp: block.timestamp,
            completed: false,
            resultCid: "",
            fee: msg.value,
            analysisType: analysisType
        });

        emit AnalysisRequested(msg.sender, requestId);

        // Simulate analysis completion (in real applications, this would be done by oracles or backend services)
        _completeAnalysis(requestId, analysisType);
    }

    /**
     * @dev Complete analysis (simulation)
     */
    function _completeAnalysis(uint256 requestId, uint8 analysisType) private {
        string memory resultCid;
        
        if (analysisType == 0) {
            resultCid = "QmDescriptiveAnalysisResult123";
        } else if (analysisType == 1) {
            resultCid = "QmUnivariateAnalysisResult456";
        } else if (analysisType == 2) {
            resultCid = "QmLogisticRegressionResult789";
        } else if (analysisType == 3) {
            resultCid = "QmLinearRegressionResultABC";
        } else if (analysisType == 4) {
            resultCid = "QmStratifiedAnalysisResultDEF";
        } else {
            resultCid = "QmCorrelationAnalysisResultGHI";
        }

        analysisRequests[requestId].completed = true;
        analysisRequests[requestId].resultCid = resultCid;

        emit AnalysisCompleted(requestId, resultCid);
    }

    // ------------ Getter Functions ------------

    function getPatientSubmissionCount(address patient) external view returns (uint256) {
        return patientSubmissions[patient].length;
    }

    function getPatientCids(address patient) external view returns (string[] memory) {
        PatientData[] storage submissions = patientSubmissions[patient];
        string[] memory cids = new string[](submissions.length);

        for (uint256 i = 0; i < submissions.length; i++) {
            cids[i] = submissions[i].ipfsCid;
        }

        return cids;
    }

    function getPatientData(address patient, uint256 index) external view returns (
        bytes memory encryptedBloodGlucose,
        bytes memory encryptionProof,
        uint256 timestamp,
        string memory ipfsCid,
        string memory loincCode,
        bool isActive
    ) {
        require(index < patientSubmissions[patient].length, "Index out of bounds");
        PatientData storage data = patientSubmissions[patient][index];
        
        return (
            data.encryptedBloodGlucose,
            data.encryptionProof,
            data.timestamp,
            data.ipfsCid,
            data.loincCode,
            data.isActive
        );
    }

    function getAnalysisRequest(uint256 requestId) external view returns (
        address researcher,
        uint256 timestamp,
        bool completed,
        string memory resultCid,
        uint256 fee
    ) {
        AnalysisRequest storage request = analysisRequests[requestId];
        return (
            request.researcher,
            request.timestamp,
            request.completed,
            request.resultCid,
            request.fee
        );
    }

    function getStats() external view returns (
        uint256 totalPatients,
        uint256 totalSubmissionsCount,
        uint256 totalRequests
    ) {
        return (
            allPatients.length,
            totalSubmissions,
            nextRequestId - 1
        );
    }

    function getAllPatients() external view returns (address[] memory) {
        return allPatients;
    }

    function isAuthorizedResearcher(address researcher) external view returns (bool) {
        return authorizedResearchers[researcher];
    }

    function getAnalysisFee() external view returns (uint256) {
        return analysisFeeBasis;
    }

    // ------------ Management Functions ------------

    function authorizeResearcher(address researcher) external onlyOwner {
        authorizedResearchers[researcher] = true;
    }

    function revokeResearcher(address researcher) external onlyOwner {
        authorizedResearchers[researcher] = false;
    }

    function updateAnalysisFee(uint256 newFee) external onlyOwner {
        analysisFeeBasis = newFee;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function deactivatePatientData(address patient, uint256 index) external onlyOwner {
        require(index < patientSubmissions[patient].length, "Index out of bounds");
        patientSubmissions[patient][index].isActive = false;
    }

    // Manually complete analysis (admin function)
    function completeAnalysis(uint256 requestId, string calldata resultCid) external onlyOwner {
        require(requestId < nextRequestId, "Invalid request ID");
        require(!analysisRequests[requestId].completed, "Analysis already completed");
        
        analysisRequests[requestId].completed = true;
        analysisRequests[requestId].resultCid = resultCid;

        emit AnalysisCompleted(requestId, resultCid);
    }

    // Get recent analysis requests
    function getRecentAnalysisRequests(uint256 limit) external view returns (uint256[] memory) {
        uint256 totalRequests = nextRequestId - 1;
        uint256 returnCount = limit > totalRequests ? totalRequests : limit;
        uint256[] memory recentRequests = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            recentRequests[i] = totalRequests - i;
        }
        
        return recentRequests;
    }

    // Get patient's latest data
    function getLatestPatientData(address patient) external view returns (
        bytes memory encryptedBloodGlucose,
        uint256 timestamp,
        string memory ipfsCid
    ) {
        require(patientSubmissions[patient].length > 0, "No data for patient");
        PatientData storage latest = patientSubmissions[patient][patientSubmissions[patient].length - 1];
        
        return (
            latest.encryptedBloodGlucose,
            latest.timestamp,
            latest.ipfsCid
        );
    }

    // Receive ETH transfers
    receive() external payable {}
}