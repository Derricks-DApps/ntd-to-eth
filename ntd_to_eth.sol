// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NTDToETHConverter {
    address public owner;
    uint256 public ntdPerEth; // e.g., 1 ETH = 100,000 NTD

    event Conversion(address indexed recipient, uint256 ntdAmount, uint256 ethAmount);
    event RateUpdated(uint256 newRate);
    event Deposited(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(uint256 initialRate) {
        owner = msg.sender;
        ntdPerEth = initialRate; // Set rate like 100000 (NTD per 1 ETH)
    }

    // Update exchange rate
    function setRate(uint256 _ntdPerEth) external onlyOwner {
        require(_ntdPerEth > 0, "Rate must be > 0");
        ntdPerEth = _ntdPerEth;
        emit RateUpdated(_ntdPerEth);
    }

    // View current rate
    function getRate() external view returns (uint256) {
        return ntdPerEth;
    }

    // View contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Calculate ETH from NTD
    function getEthAmount(uint256 ntdAmount) public view returns (uint256) {
        require(ntdPerEth > 0, "Exchange rate not set");
        return (ntdAmount * 1 ether) / ntdPerEth;
    }

    // Convert and send ETH to recipient
    function convertAndSend(address payable recipient, uint256 ntdAmount) external onlyOwner {
        uint256 ethAmount = getEthAmount(ntdAmount);
        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");
        recipient.transfer(ethAmount);
        emit Conversion(recipient, ntdAmount, ethAmount);
    }

    // Allow contract to receive ETH
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    // Optional: withdraw ETH from contract
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit Withdrawn(to, amount);
    }
}
