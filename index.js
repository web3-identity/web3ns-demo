const { Conflux } = require('js-conflux-sdk');
const { Web3Domain, namehash, labelhash } = require('@web3identity/web3ns');

// Testnet URL
const conflux = new Conflux({
    url: 'https://test.confluxrpc.com',
    networkId: 1,
});

const account = conflux.wallet.addPrivateKey('0x1488102451c61272cf55aa743c4202096e0e0bdd53240e57e117d28d858ff052');
console.log(account.address);

// Testnet CNS addresses
const web3domain = new Web3Domain({
    client: conflux,
    registryAddress: 'cfxtest:acen57mpbzvs774tk6kffcsbkef3m4mn5eh0nxy4jx',
    reverseRegistrarAddress: 'cfxtest:acfarpzehntpre0thg8x7dp0ajw4ms328pe1mm17vd',
    baseRegistrarAddress: 'cfxtest:acg08bujp0kmsup1zk11c9mad7zd6648eynbcjtndm',
    web3ControllerAddress: 'cfxtest:aca1858y5a9fnyx9rxd1c9knr517cd0e6afzzhgj01',
    nameWrapperAddress: 'cfxtest:acapc3y2j7atme3bawvaex18hs36tn40uu5h6j3mtu',
    publicResolverAddress: 'cfxtest:acbfyf69zaxau5a23w10dgyrmb0hrz4p9pewn6sejp',
});

async function main() {
    const owner = await web3domain.Registry.owner(namehash('conflux.web3'));
    console.log(`Owner of ${'conflux.web3'} is : ${owner}`);

    await purchaseDomain();
}

main().catch(console.error);

// this function demonstrates how to purchase a domain with CFX
async function purchaseDomain() {
    // To Purchase a domain, you need to proceed with the following steps:
    // 0. check label status
    // 1. makeCommitment
    // 2. commit
    // 3. register

    const labelToBuy = 'confluxxxxx';
    const status = await web3domain.Web3Controller.labelStatus(labelToBuy);
    // The label status enum is defined here: https://github.com/web3-identity/cns-contracts/blob/master/docs/Web3Controller.md#labelstatus
    // status === 0 means the label is available
    console.log(`Status of ${labelToBuy} is : ${status}`);
    if (status != 0) {
        console.log('Label is not available');
        return;
    }
    const ONE_YEAR = 3600 * 24 * 365;
    const publicResolverAddress = 'cfxtest:acbfyf69zaxau5a23w10dgyrmb0hrz4p9pewn6sejp';
    const commitment = await web3domain.Web3Controller.makeCommitment(labelToBuy, account.address, ONE_YEAR, labelhash(labelToBuy), publicResolverAddress, [], true, 0, ONE_YEAR);
    // console.log(commitment);

    let receipt = await web3domain.Web3Controller.commit(commitment).sendTransaction({
        from: account.address,
    }).executed();
    // outcomeStatus 0 is success, 1 is fail
    console.log(receipt);


    // wait for more than 10 seconds
    let rentPrice = await web3domain.Web3Controller.rentPrice(labelToBuy, ONE_YEAR);
    const totalPrice = rentPrice[0] + rentPrice[1];
    console.log(totalPrice.toString());
    let receipt2 = await web3domain.Web3Controller.register(labelToBuy, account.address, ONE_YEAR, labelhash(labelToBuy), publicResolverAddress, [], true, 0, ONE_YEAR).sendTransaction({
        from: account.address,
        value: totalPrice,  // make sure the sender has enough CFX to pay for the domain
    }).executed();
    console.log(receipt2);

}