<template>
  <div id="app">
    <div class="container">
      <!-- 搜索框 -->
      <div class="row justify-content-lg-end">
        <div class="col-lg-6 col-12">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text" id="inputGroup-sizing-default">
                <i class="bi-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-default"
              v-model="keyWord" />
            <button type="button" class="btn btn-primary" @click="searchClick">搜索</button>
          </div>
        </div>
      </div>
      <div v-for="(value, key) in blockletData" :key="key">
        <div class="row row-style">
          <div class="col-lg-4 col-4 col-style">
            <span class="col-title">{{ key }}</span>
          </div>
          <div class="col-lg-8 col-8 col-style">
            <span class="col-content">{{ value || '--' }}</span>
          </div>
        </div>
      </div>
      <div class="row-block-title">
        <div class="block-title">Block Transactions</div>
      </div>
      <div v-for="item in transactionsData" :key="item.Hash" class="transactions-block">
        <div class="row transactions-row">
          <span class="col-lg-2 col-4 transactions-row-title">Free</span>
          <span class="col-lg-5 col-8 transactions-row-content">{{ item.free }}</span>
          <span class="col-lg-2 col-4 transactions-row-title block-visibility">Amount</span>
          <span class="col-lg-3 col-8 transactions-row-content">--</span>
        </div>
        <div class="row transactions-row">
          <span class="col-lg-2 col-4 transactions-row-title">Hash</span>
          <span class="col-lg-5 col-8 transactions-row-content transactions-hash">{{ item.Hash }}</span>
          <span class="col-lg-2 col-4 transactions-row-title block-visibility">Date</span>
          <span class="col-lg-3 col-8 transactions-row-content">{{ item.time }}</span>
        </div>
        <div class="row transactions-row">
          <span class="col-lg-2 col-4 transactions-row-title block-visibility">From</span>
          <span class="col-lg-5 col-8 transactions-row-content">--</span>
          <span class="col-lg-2 col-4 transactions-row-title block-visibility">To</span>
          <span class="col-lg-3 col-8 transactions-row-content">--</span>
        </div>
      </div>
      <!-- 分页 -->
      <div class="row row-pagination">
        <!--boostrap4 版本-->
        <ul class="pagination" @click="pageClick">
          <li class="page-item">
            <a class="page-link" href="#" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li class="page-item" v-show="page > 10" @click.stop="pageChangeMore(-10)"><a class="page-link">-10</a></li>
          <li class="page-item" :class="{ active: value === page }" v-for="(value, key) in pageArr" :key="key + value">
            <a class="page-link">{{ value }}</a>
          </li>
          <li class="page-item"><a class="page-link" @click.stop="pageChangeMore(10)">+10</a></li>
          <li class="page-item">
            <a class="page-link" href="#" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="spinner-loading" v-show="showLoader">
      <div class="spinner-border text-primary" role="status">
        <!-- <span class="sr-only">Loading...</span> -->
      </div>
    </div>
    <div v-if="showToast" class="alert-block">
      <div class="alert alert-warning">获取交易数据失败！</div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'App',
  data() {
    return {
      keyWord: '00000000000000000007878ec04bb2b2e12317804810f4c26033585b3f81ffaa',
      page: 1,
      showLoader: false,
      showToast: false,
      pageLength: 5,
      blockletData: {
        Hash: '',
        Confirmations: '',
        Timestamp: '',
        Height: '',
        Miner: '',
        'Number of Transactions': '',
        Difficulty: '',
        'Merkle root': '',
        Version: '',
        Bits: '',
        Weight: '',
        Size: '',
        Nonce: '',
        'Transaction Volume': '',
        'Block Reward': '',
        'Fee Reward': '',
      },
      allTransactionsData: [],
      transactionsData: [],
      pageArr: [],
    };
  },
  mounted() {
    this.getBlockletData();
    this.computedPage();
  },
  methods: {
    /*
     *@functionName: searchClick
     *@description: 点击搜索事件
     *@date: 2022-05-22 05:36:38
     */
    searchClick() {
      this.getBlockletData();
    },
    /*
     *@functionName: getBlockletData
     *@description: 获取数据
     *@date: 2022-05-22 00:40:18
     */
    getBlockletData() {
      this.showLoader = true;
      const keyWord = this.keyWord.trim();
      const api = `https://blockchain.info/rawblock/${keyWord}`;
      let blockletData = { ...this.blockletData };
      this.axios
        .get(api)
        .then((response) => {
          if (response.status === 200) {
            const resData = response.data;
            blockletData.Hash = resData.hash;
            blockletData.Height = resData.height;
            blockletData['Merkle root'] = resData.mrkl_root;
            blockletData['Number of Transactions'] = resData.n_tx;
            blockletData.Timestamp = moment(resData.time * 1000).format('YYYY-MM-DD hh:mm:ss');
            blockletData.Weight = resData.weight.toLocaleString() + ' WU';
            blockletData.Nonce = resData.nonce.toLocaleString();
            blockletData.Size = resData.size.toLocaleString() + ' bytes';
            blockletData.Version = '0x' + resData.ver.toString(16);
            blockletData.Bits = resData.bits.toLocaleString();
            this.allTransactionsData = resData.tx;
            this.handleTransactionsData(resData.tx);
            console.log(resData);
            console.log(resData.tx);
            this.blockletData = blockletData;
            this.showLoader = false;
          }
        })
        .catch((res) => {
          console.log(res.response);
          this.showLoader = false;
          this.showToast = true;
          const timeOut = setTimeout(() => {
            this.showToast = false;
            clearTimeout(timeOut);
          }, 2000);
        });
    },
    /*
     *@functionName: handleTransactionsData
     *@params1: allTransactionsData
     *@description: 处理交易数据
     *@date: 2022-05-22 03:30:26
     */
    handleTransactionsData(allTransactionsData) {
      if (!Array.isArray(allTransactionsData) || allTransactionsData.length === 0) return [];
      const maxNum = this.page * this.pageLength;
      let resData = [];
      for (let i = maxNum - 5; i < maxNum; i++) {
        resData.push({
          Hash: allTransactionsData[i].hash,
          free: allTransactionsData[i].fee / 100000000 + ' BTC',
          time: moment(allTransactionsData[i].time * 1000).format('YYYY-MM-DD hh:mm:ss'),
        });
      }
      this.transactionsData = resData;
    },
    /*
     *@functionName: computedPage
     *@description: 计算分页数组
     *@date: 2022-05-22 05:05:26
     */
    computedPage() {
      const page = this.page;
      let start = 1;
      let end = page + 2;
      if (page > 2) {
        start = page - 2;
      } else {
        end = 5;
      }
      let pageArr = [];
      for (let i = start; i <= end; i++) {
        pageArr.push(i);
      }
      this.pageArr = pageArr;
    },
    /*
     *@functionName: pageClick
     *@params1: event
     *@description: 分页点击时间
     *@date: 2022-05-22 05:19:56
     */
    pageClick(event) {
      let page = parseInt(event.target.innerText);
      this.page = page;
      this.computedPage();
      this.handleTransactionsData(this.allTransactionsData);
    },
    /*
     *@functionName: pageChangeMore
     *@params1: num
     *@description: 加10或者减10的操作
     *@date: 2022-05-22 05:28:26
     */
    pageChangeMore(num) {
      this.page = this.page + num;
      this.computedPage();
      this.handleTransactionsData(this.allTransactionsData);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.row-style {
  border-bottom: 1px solid rgb(223, 227, 235);
  word-wrap: break-word;
}
.col-style {
  padding: 13px 0px;
  text-align: left;
}
.col-title {
  color: rgb(103, 113, 133);
  font-size: 16px;
}
.col-content {
  color: rgb(53, 63, 82);
  font-size: 16px;
}
.row-pagination {
  padding-top: 15px;
}
.row-block-title {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}
.block-title {
  padding: 16px 0px;
  font-weight: 700;
  font-size: 1.5rem;
  text-transform: none;
  font-style: normal;
  font-family: Inter, Helvetica, sans-serif;
  font-feature-settings: 'calt' 0;
  color: rgb(53, 63, 82);
}
.transactions-row-title {
  color: rgb(103, 113, 133);
  font-weight: 500;
  font-size: 14px;
  text-transform: none;
  font-style: normal;
  font-family: Inter, Helvetica, sans-serif;
  font-feature-settings: 'calt' 0;
}
.transactions-row {
  padding: 0px 15px;
}
.transactions-row span {
  text-align: left;
  padding: 12px 0px;
}
.transactions-row-content {
  word-wrap: break-word;
  padding-right: 10px !important;
}
.transactions-hash {
  color: rgb(12, 108, 242);
}
.block-visibility {
  visibility: hidden;
}
@media (max-width: 576px) {
  .block-visibility {
    visibility: visible;
  }
}
.page-item {
  cursor: pointer;
}
.spinner-loading {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  filter: Alpha(Opacity=60);
  opacity: 0.6;
}
.alert-block {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
