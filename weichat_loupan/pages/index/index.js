var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({
  data: {
    selectPerson: true,
    firstPerson: '上海',
    selectArea: false,
    latitude: 0,
    longitude: 0,
    speed: 0,
    accuracy: 16,
    markers: [],
    covers: [],
    scale:12
  },

  //点击选择类型
  clickPerson: function () {
    var selectPerson = this.data.selectPerson;
    if (selectPerson == true) {
      this.setData({
        selectArea: true,
        selectPerson: false,
      })
    } else {
      this.setData({
        selectArea: false,
        selectPerson: true,
      })
    }
  },
  //点击切换
  mySelect: function (e) {
    wx.setStorageSync('city', e.target.dataset.name);
    this.onShow();
    this.setData({
      firstPerson: e.target.dataset.name,
      selectPerson: true,
      selectArea: false,
    })

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'UNFBZ-XKMKQ-6TA5R-G5CUX-GUWHV-L3BHF'
    });


    
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {

    console.dir(qqmapsdk);
    // qqmapsdk.InfoWindow();

   var that =this; 
    if (!!wx.getStorageSync('city')){

      this.setData({
        firstPerson: wx.getStorageSync('city'),
        selectPerson: true,
        selectArea: false,
      })

      // 调用接口
      qqmapsdk.geocoder({
        address: wx.getStorageSync('city'),
        success: function (res) {
          console.log(res);
          if (res.status==0){
            that.setData({
              longitude: res.result.location.lng,
              latitude: res.result.location.lat
            })
          }
      
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          console.log(res);
        }
      });
    }else{

      that.setData({
        longitude: 121.48941,
        latitude: 31.40527
      })

    }


    // // 页面显示
    // var markers = [{
    //   latitude: 31.23,
    //   longitude: 121.47,
    //   name: '浦东新区',
    //   desc: '我的位置',
    //   callout
    // }]


    var markers= [{
      id: 0,
    latitude: 31.23,
      longitude: 121.47,
      width: 35,
      height: 30,
      callout: {
        content: "                 万科海上传奇   \n[浦东新区- ]御桥路1679号（近沪南路）    \n[价格待定] \n[地铁沿线] [旅游地产] [科技住宅]  \n[住宅 公寓 普通住宅 ]",
        color: "#000000",
        fontSize: 12,
        borderRadius: 20,
        bgColor: "#ffffff",
        padding: 10,
        display: "BYCLICK"
      }
    },
      {
        id: 1,
        latitude: 33.23,
        longitude: 126.47,
        width: 35,
        height: 30,
        callout: {
          content: "                 万科海上传奇   \n[浦东新区- ]御桥路1679号（近沪南路）    \n[价格待定] \n[地铁沿线] [旅游地产] [科技住宅]  \n[住宅 公寓 普通住宅 ]",
          color: "#000000",
          fontSize: 12,
          borderRadius: 20,
          bgColor: "#ffffff",
          padding: 10,
          display: "BYCLICK"
        }
      }
    ]

    var covers = [{
      latitude: 31.23,
      longitude: 121.47,
      rotate: 0
    }]
    this.setData({
      markers: markers,
      covers: covers,
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  markertap(e) {
 
    console.log(e.markerId)
  }
})