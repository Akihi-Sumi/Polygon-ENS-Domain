const main = async () => {
    // Domainsコントラクトがコンパイルされ、コントラクトを扱うために必要なファイルがartifactsディレクトリの直下に生成され。
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');

    // ローカルのEthereumネットワークを、コントラクトのためだけに作成
    // スクリプトの実行が完了した後、そのローカル・ネットワークを破棄
    const domainContract = await domainContractFactory.deploy("ninja");

    // Domainsコントラクトが、ローカルのブロックチェーンにデプロイされるまで待つ
    await domainContract.deployed();

    // デプロイされたスマートコントラクトのアドレスを出力
    console.log("Contract deployed to:", domainContract.address);

    let txn = await domainContract.register("mortal", {
        value: hre.ethers.utils.parseEther("0.01"),
    });
    await txn.wait();

    const address = await domainContract.getAddress("mortal");
    console.log("Owner of domain mortal:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    }
    catch(err) {
        console.log(err)
        process.exit(1)
    }
}

runMain()