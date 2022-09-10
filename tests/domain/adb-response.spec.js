const AdbResponse = require("../../src/domain/adb-response.js");

describe("suite", () => {
  test("parses devices list", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
W4IZAMAIBASWV4MR       device usb:1-3 product:tidy_goertek2601_l model:ELEMNT_BOLT device:goertek2601_l transport_id:33
43212600473            device usb:1-2.2 product:bolt2p0 model:ELEMNT_BOLT2 device:bolt2p0 transport_id:4
S47T4P7HI7NNTWY9       device usb:1-9 product:elemnt_v2 model:ELEMNT device:goertek2601_l transport_id:4

`
    );

    expect(devices).toStrictEqual([
      { id: "W4IZAMAIBASWV4MR", model: "ELEMNT BOLT", authorized: true },
      { id: "43212600473", model: "ELEMNT BOLT V2", authorized: true },
      { id: "S47T4P7HI7NNTWY9", model: "ELEMNT V2", authorized: true },
    ]);
  });

  test("parses unauthorized devices", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
43212600473            unauthorized usb:1-2.2 transport_id:39

  `
    );

    expect(devices).toStrictEqual([
      { id: "43212600473", model: "UNKNOWN", authorized: false },
    ]);
  });

  test("orders authorized above unauthorized", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
43212600473            unauthorized usb:1-2.2 transport_id:39
W4IZAMAIBASWV4MR       device usb:1-3 product:tidy_goertek2601_l model:ELEMNT_BOLT device:goertek2601_l transport_id:33

`
    );

    expect(devices).toStrictEqual([
      { id: "W4IZAMAIBASWV4MR", model: "ELEMNT BOLT", authorized: true },
      { id: "43212600473", model: "UNKNOWN", authorized: false },
    ]);
  });

  test("ignores non wahoo devices", async () => {
    let devices = new AdbResponse().parseDevices(
      `List of devices attached
ZY3266V977             device usb:1-2.2 product:lineage_ocean model:moto_g_7__power device:ocean transport_id:42

`
    );

    expect(devices).toStrictEqual([]);
  });

  test("parses battery info", async () => {
    let batteryInfo = new AdbResponse().parseBatteryInfo(
      `
Current Battery Service state:
  AC powered: false
  USB powered: true
  Wireless powered: false
  status: 5
  health: 2
  present: true
  level: 100
  scale: 100
  voltage: 4269
  temperature: 360
  technology: Li-ion
`
    );

    expect(batteryInfo).toEqual({
      "ac-powered": "false",
      health: "2",
      level: "100",
      present: "true",
      scale: "100",
      status: "5",
      technology: "li-ion",
      temperature: "360",
      "usb-powered": "true",
      voltage: "4269",
      "wireless-powered": "false",
    });
  });

  test("parses apk info", async () => {
    let apkInfo = new AdbResponse().parseApkInfo(
      `
Packages:
  Package [com.wahoofitness.bolt] (171c052):
    userId=10057 gids=[3002, 3001, 1028, 1015, 3003]
    pkg=Package{17740f23 com.wahoofitness.bolt}
    codePath=/data/app/com.wahoofitness.bolt-1
    resourcePath=/data/app/com.wahoofitness.bolt-1
    legacyNativeLibraryDir=/data/app/com.wahoofitness.bolt-1/lib
    primaryCpuAbi=armeabi-v7a
    secondaryCpuAbi=null
    versionCode=15152 targetSdk=30
    versionName=1.60.0.70
    splits=[base]
    applicationInfo=ApplicationInfo{10726b1a com.wahoofitness.bolt}
    flags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP LARGE_HEAP ]
    dataDir=/data/data/com.wahoofitness.bolt
    supportsScreens=[small, medium, large, xlarge, resizeable, anyDensity]
    timeStamp=2022-08-31 05:51:07
    firstInstallTime=2017-02-16 16:49:30
    lastUpdateTime=2022-08-31 05:51:21
    installerPackageName=com.wahoofitness.bolt
    signatures=PackageSignatures{31194c20 [1db759d9]}
    permissionsFixed=true haveGids=true installStatus=1
    pkgFlags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP LARGE_HEAP ]
    User 0:  installed=true hidden=false stopped=false notLaunched=false enabled=0
    grantedPermissions:
      android.permission.WRITE_SETTINGS
      android.permission.ACCESS_FINE_LOCATION
      android.permission.ACCESS_MOCK_LOCATION
      android.permission.SET_TIME_ZONE
      android.permission.BLUETOOTH
      android.permission.INTERNET
      android.permission.BLUETOOTH_ADMIN
      android.permission.READ_EXTERNAL_STORAGE
      android.permission.CHANGE_WIFI_STATE
      android.permission.ACCESS_NETWORK_STATE
      android.permission.WRITE_EXTERNAL_STORAGE
      android.permission.ACCESS_WIFI_STATE
      android.permission.WAKE_LOCK
`
    );

    expect(apkInfo).toEqual({
      lastUpdated: "2022-08-31 05:51:21",
      versionCode: "15152",
      versionName: "1.60.0.70",
    });
  });

  test("parses netstat", async () => {
    let info = new AdbResponse().parseNetstat(
      `
Active Internet connections (established and servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program Name
tcp        0      0 127.0.0.1:5037          0.0.0.0:*               LISTEN      1875/adbd
tcp6       0      0 :::8080                 :::*                    LISTEN      1164/com.wahoofitness.bolt
`
    );

    expect(info).toEqual([
      {
        proto: "tcp",
        localAddress: "127.0.0.1",
        localPort: 5037,
        foreignAddress: "0.0.0.0",
        foreignPort: null,
        state: "LISTEN",
        pid: 1875,
        program: "adbd",
      },
      {
        proto: "tcp6",
        localAddress: "::",
        localPort: 8080,
        foreignAddress: "::",
        foreignPort: null,
        state: "LISTEN",
        pid: 1164,
        program: "com.wahoofitness.bolt",
      },
    ]);
  });

  test("parses netcfg", async () => {
    let interfaces = new AdbResponse().parseNetcfg(
      `
ip6tnl0  DOWN                                   0.0.0.0/0   0x00000080 00:00:00:00:00:00
wlan0    UP                               192.168.1.132/24  0x00001043 2c:4d:79:45:2e:dc
lo       UP                                   127.0.0.1/8   0x00000049 00:00:00:00:00:00
`
    );

    expect(interfaces).toEqual([
      {
        name: "ip6tnl0",
        state: "DOWN",
        address: "0.0.0.0",
      },
      {
        name: "wlan0",
        state: "UP",
        address: "192.168.1.132",
      },
      {
        name: "lo",
        state: "UP",
        address: "127.0.0.1",
      },
    ]);
  });

  test("parses ifconfig", async () => {
    let interfaces = new AdbResponse().parseIfconfig(
      `
wlan0     Link encap:Ethernet  HWaddr b4:6f:2d:08:81:23  Driver wcnss_wlan
          inet addr:192.168.1.158  Bcast:192.168.1.255  Mask:255.255.255.0 
          inet6 addr: fe80::b66f:2dff:fe08:8123/64 Scope: Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:2652 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:266 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:1000 
          RX bytes:273096 TX bytes:32993 

dummy0    Link encap:Ethernet  HWaddr e6:b6:c2:62:de:49
          inet6 addr: fe80::e4b6:c2ff:fe62:de49/64 Scope: Link
          UP BROADCAST RUNNING NOARP  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:10 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:0 
          RX bytes:0 TX bytes:700 

`
    );

    expect(interfaces).toEqual([
      {
        name: "wlan0",
        state: "UP",
        address: "192.168.1.158",
      },
      {
        name: "dummy0",
        state: "UP",
      },
    ]);
  });
});
