var CONTRACT_ADDRESS = 
"0xB591Cd885f77A26418E88BFa60cF3EfF75d7ba8d"
;
var CONTRACT_ABI = 
[{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"getResult","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroyContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"}]
;
var DEFAULT_WEB3_HTTP_PROVIDERS = [
"https://mainnet.infura.io"
];
var GAS_LIMIT = 50000;
var ETHER_SCAN_URL_TX = "https://etherscan.io/tx/";

var omikuji = {};
omikuji.web3 = null;
omikuji.contract = null;
omikuji.isMetamaskAvailable = false;

function getVal(getKey) {
    var result = null;
    location.search.substr(1).split("&").forEach(function (param) {
		var kv = param.split("=");
		if (kv[0] === getKey) result = decodeURIComponent(kv[1]);
    });
    return result;
}

function getFortune(num) {
	switch(num) {
		case 1:
			return "大吉";
		case 2:
			return "吉";
		case 3:
			return "中吉";
		case 4:
			return "小吉";
		case 5:
			return "末吉";
		case 6:
			return "凶";
		case 7:
			return "大凶";
		default:
			return "エラー";
	}
}

function setup() {

	var address = getVal('address');
	if (address) {
		console.log(address);
		$('#result_address').text(address);
		omikuji.contract.getResult(address, function(error, result){
			if(!error) {
        		console.log(result);
        		var fortuneNum = result['c'][0];
        		console.log(fortuneNum);
        		$('#result_omikuji').text(getFortune(fortuneNum));

        		if (fortuneNum == 0) {
        			$('#result_note').show();
        		}

        		$('#result').show();
        	}
		});
	}

	// omikuji_submit_button
	$('#omikuji_submit_button').click(function(e) {

		if (!omikuji.isMetamaskAvailable) {
			alert('MetaMask をインストールするか、Ether を直接コントラクトに送付してね！');
			return;
		}
		
		// 入力された Ether の値を取得
		var ethValue = $('#f_eth_value').val();

		// Ether の値を Wei に変換
		var weiValue = omikuji.web3.toWei(ethValue, 'ether');
		
		// Transaction Object
		var transactionObject = {to: CONTRACT_ADDRESS, value: weiValue, gasLimit: GAS_LIMIT};
		
		// Transaction を実行
		omikuji.web3.eth.sendTransaction(transactionObject, function(error, transactionHash) {
			if (!error) {
				// モーダルを表示
			    $('#modal_transaction_sent').iziModal({
					title: 'トランザクションが送信されました。',
					padding: 20,
					width: 800,
					closeButton: true	
				});
			    $('#modal_transaction_sent').iziModal('open');
			    $('#modal_transaction_sent').iziModal('startLoading');
	    		$('#modal_transaction_sent_transaction_hash').append(
					$("<a></a>", {
						href: ETHER_SCAN_URL_TX + transactionHash,
						text: transactionHash,
						target: '_blank',
					})
	    		);
			    omikuji.web3.eth.getTransaction(transactionHash, function(error, result) {
			    	if (!error) {
			    		console.log(result);
			    		$('#modal_transaction_sent_from').text(result.from);
			    		$('#modal_transaction_sent_to').text(result.to);
		    			// show_result_button
						$('#show_result_button').click(function(e) {
							var url = "/NSSO?" + $.param({address:result.from});
							console.log(url);
							window.location.href = url;
							// window.open(url);
						});	
					    $('#modal_transaction_sent').iziModal('stopLoading');
			    	} else {
			    		alert('something wrong.');
			    	}
			    });

			} else {
				alert('something wrong.');
			}
		});	
	});

}

window.addEventListener('load', function() {
	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof web3 !== 'undefined') {
		// Use Mist/MetaMask's provider
		console.log('Using MetaMask!')
		omikuji.web3 = new Web3(web3.currentProvider);
		omikuji.isMetamaskAvailable = true;
    } else {
    	console.log('No web3? You should consider trying MetaMask!')
    	// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    	// window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    	omikuji.web3 = new Web3(new Web3.providers.HttpProvider(DEFAULT_WEB3_HTTP_PROVIDERS[0]));
    }
    omikuji.contract = omikuji.web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

    setup();
});