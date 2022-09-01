const { store, component } = require("./lib/reef.es.js");
const Mustache = require("./lib/mustache.js");
const $ = require("./lib/jquery.js");

const Api = require("./api.js");
const ElectronApi = require("./api/electron.js");

let data = store({
  loaders: {},
  errors: {},
  messages: {},
  device: null,
  devices: [],
});

let api = new Api({ data: data, backend: new ElectronApi({ delay: 1000 }) });

api.loadDevices();

function devices() {
  return Mustache.render(
    `
  <ul>
  {{#devices}}
  <li class="">
  {{#authorized}}
    <div class="flex border-t-2 border-gray-200 {{#selected}}bg-gray-50 cursor-pointer{{/selected}}{{^selected}}hover:bg-gray-200 cursor-pointer{{/selected}} device-card py-4">
      <div class="flex-none w-12 text-center self-center">
        <input type="radio" name="device" value="{{id}}" class="device-radio" {{#selected}}checked="checked"{{/selected}}>
      </div>
      <div>
        <div>
          {{model}}
        </div>
        <div>{{id}}</div>
        <div class="flex items-center gap-1">
          <div class="w-10 bg-gray-200 h-2">
            <div class="bg-green-600 h-2" style="width: {{batteryInfo.level}}%"></div>
          </div>
          <span class="text-xs">{{batteryInfo.level}}%</span>
        </div>
      </div>
    </div>
  {{/authorized}}
  {{^authorized}}
    <div class="flex border-t-2 border-gray-200 py-4">
      <div class="flex-none w-12 text-center self-center">
      </div>
      <div>
        {{model}}<br />
        {{id}}
        <div class="bg-yellow-400 rounded-lg px-1">not authorized</div>
      </div>
    </div>
  {{/authorized}}
  </li>
  {{/devices}}
  </ul>
  `,
    data
  );
}

function device() {
  return Mustache.render(
    `
  {{#loaders.device}}
  <div class="w-full mt-10">
    <img class="spinner mx-auto" src="icons/feather/loader.svg" width="80" />
  </div>
  {{/loaders.device}}
  {{#device}}
  {{^loaders.device}}
  <div class="space-y-4 pb-4">

  <h1 class="text-xl">{{model}} {{id}}</h1>

  <div class="card">
    <h5 class="card-header">Maps</h5>
    <p class="text-gray-700 text-base mb-4">
      Upload previously generated maps directly to your device. Please choose a ZIP file. Maps are created by using <a
      href="https://github.com/treee111/wahooMapsCreator" class="underline" target="_blank">wahooMapsCreator</a>.
    </p>

    <div class="upload-map">
      <div>
        <button class="btn file-browse" data-click="selectFile">Choose file</button>
      </div>

      <div class="pt-4">
      {{#loaders.uploadMap}}
        <button type="button" class="btn btn-disabled" disabled="disabled">
        <span class="flex">
          Uploading...&nbsp;
          <img class="spinner" src="icons/feather/loader.svg" width="14" />
        </span>
        </button>
      {{/loaders.uploadMap}}
      {{^loaders.uploadMap}}
        <button type="button" class="btn btn-primary" data-id="{{id}}" data-click="uploadMap">Upload</button>
      {{/loaders.uploadMap}}
      {{#messages.uploadMap}}
        <div class="bg-green-400 text-white text-xs p-1 mt-2 rounded-md">
          {{messages.uploadMap}}
        </div>
      {{/messages.uploadMap}}
      {{#errors.uploadMap}}
        <div class="bg-red-400 text-white text-xs p-1 mt-2 rounded-md">
          ERROR: {{errors.uploadMap}}
        </div>
      {{/errors.uploadMap}}
      </div>
    </div>
  </div>

  <div class="card">
    <h5 class="card-header">Screenshots</h5>
    <div class="flex flex-wrap gap-4">
      {{#loaders.takeScreenshot}}
      <div class="w-full mt-10">
        <img class="spinner mx-auto" src="icons/feather/loader.svg" width="80" />
      </div>
      {{/loaders.takeScreenshot}}
      {{^loaders.takeScreenshot}}
      <div>
        <p class="text-gray-700 text-base mb-4">
          Take a screenshot.
        </p>
        <div>
          <button class="btn btn-primary" data-id="{{id}}" data-click="takeScreenshot">Take screenshot</button>
        </div>
      </div>
      <div class="flex-grow"></div>
      <div>
        {{#device.screenshot}}
        <img src="data:image/png;base64,{{device.screenshot}}">
        {{/device.screenshot}}
      </div>
      {{/loaders.takeScreenshot}}
    </div>
  </div>

  <div class="card">
    <div class="flex">
      <h5 class="flex-shrink-0 card-header">Hidden Features</h5>

    {{#loaders.hiddenFeatures}}
    </div>
    <div class="w-full my-4 text-xs text-center">
      <img class="spinner mx-auto" src="icons/feather/loader.svg" width="80" />
      Loading features from the device...
    </div>
    {{/loaders.hiddenFeatures}}
    {{^loaders.hiddenFeatures}}
      <div class="flex-grow"></div>
      <button type="button" data-id="{{id}}" data-click="reloadFeatures"><img src="icons/feather/refresh-cw.svg" width="14" /></button>
    </div>

    <p class="text-gray-700 text-base mb-4">
      Enable or disable some hidden features.
    </p>

    <div class="hidden-features">
    <div>
      <ul>
      {{#features}}
        <li>
        <input type="checkbox" name="{{id}}" {{#enabled}}checked="checked"{{/enabled}} />
        {{name}}</li>
      {{/features}}
      </ul>
    </div>
    <div class="pt-4">
    {{#loaders.saveFeatures}}
      <button type="button" class="btn btn-disabled" disabled="disabled">
      <span class="flex">
        Saving...&nbsp;
        <img class="spinner" src="icons/feather/loader.svg" width="14" />
      </span>
      </button>
    {{/loaders.saveFeatures}}
    {{^loaders.saveFeatures}}
      <button type="button" class="btn btn-primary" data-id="{{id}}" data-click="saveFeatures">Save</button>
    {{/loaders.saveFeatures}}
    </div>
    </div>
    {{/loaders.hiddenFeatures}}
  </div>
  </div>
  {{/loaders.device}}

  {{/device}}
  {{^device}}
  <div class="alert alert-warning">No device selected</div>
  {{/device}}
  `,
    data
  );
}

function app() {
  return Mustache.render(
    `
  {{^devices}}
  {{#loaders.devices}}
  <div class="w-full mt-10 text-center">
    <img class="spinner mx-auto" src="icons/feather/loader.svg" width="80" />
    <span>Looking for connected devices...</span>
  </div>
  {{/loaders.devices}}
  {{^loaders.devices}}
  <div class="alert alert-warning mt-10">
    <div class="flex gap-4 content-top">
      <div>
        <img class="mx-auto" src="icons/feather/alert-circle.svg" width="80" />
      </div>
      <div>
      <h5 class="text-xl font-bold">
        No devices available
      </h5>
      <p class="pb-4">
        Make sure your device is in "Debugging" mode and is connected to your computer via a Data
        cable (not just a charging one).
      </p>
      <p>
        <ol class="list-decimal list-inside">
          <li>turn the device on (make sure it's not connected via usb yet)</li>
          <li>press keys on device
            <ul class="pl-4 list-disc list-inside">
            <li>BOLT v1 and ROAM
            <ul class="pl-4 list-disc list-inside">
              <li>press the power button (you enter the settings menu)</li>
              <li>press the power button again (you return to the normal screen)</li>
            </ul>
          </li>
          <li>BOLT v2
            <ul class="pl-4 list-disc list-inside">
              <li>press the power, up and down buttons at the same time (this is a bit hard, but give it several tries if it doesn't work)</li>
            </ul>
          </li>
          </ul>
          </li>
          <li>connect the device to your pc</li>
          <li>click refresh button below</li>
        </ol>
      </p>
      </div>
    </div>
    <div class="text-center mt-10">
      <button type="button" class="btn" data-click="loadDevices"><img src="icons/feather/refresh-cw.svg" width="40" /></button>
    </div>
  </div>
  {{/loaders.devices}}
  {{/devices}}
  {{#devices.0}}
  <div class="flex">
      <div class="flex-none w-1/3 pt-4">
          <div class="pl-4 pr-4 pb-4 flex">
            <span>Devices</span>
            <div class="flex-grow"></div>
            <button type="button" data-click="loadDevices"><img src="icons/feather/refresh-cw.svg" width="14" /></button>
          </div>

          {{{devicesComponent}}}
      </div>
      <div class="w-full h-screen bg-gray-50 p-4">
          {{{device}}}
      </div>
  </div>
  {{/devices.0}}
  `,
    {
      ...data,
      devicesComponent: function (text, render) {
        return devices();
      },
      device: function (text, render) {
        return device();
      },
    }
  );
}

const handlers = {
  loadDevices: function (_event, el) {
    api.loadDevices();
  },
  saveFeatures: function (_event, el) {
    let $el = $(el);

    let deviceId = $el.data("id");
    let features = {};
    $el
      .parents(".hidden-features")
      .find('input[type="checkbox"]')
      .each((i, v) => {
        features[$(v).attr("name")] = $(v).is(":checked");
      });
    api.saveFeatures(deviceId, features);
  },
  reloadFeatures: function (_event, el) {
    let $el = $(el);

    api.loadDeviceFeatures($el.data("id"));
  },
  selectFile(_event, el) {
    api.selectFile().then((mapFile) => {
      if (mapFile) {
        $(".file-browse").text(mapFile);
      }
    });
  },
  uploadMap(_event, el) {
    let $el = $(el);

    let path = $(".file-browse").text();

    api.uploadMap($el.data("id"), path);
  },
  takeScreenshot(_event, el) {
    let $el = $(el);

    let deviceId = $el.data("id");

    api.takeScreenshot(deviceId);
  },
};

component("#app", app);

$(document).ready(() => {
  document
    .getElementsByTagName("body")[0]
    .addEventListener("click", function (e) {
      let $el = $(e.target);

      console.log(e.target);

      if ($el.hasClass("device-card") || $el.parents(".device-card").length) {
        let $radio = $el.hasClass("device-card")
          ? $el.find('input[type="radio"]')
          : $el.parents(".device-card").find('input[type="radio"]');

        if ($radio.length) {
          $radio.prop("checked", true);

          api.selectDevice($radio.eq(0).attr("value"));
        }
      } else if ($el.data("click") || $el.parent().data("click")) {
        var fn = $el.data("click") || $el.parent().data("click");
        var el = $el.data("click") ? $el.get(0) : $el.parent().get(0);

        if (handlers[fn]) {
          handlers[fn].apply(null, [e, el]);
        } else {
          console.log(`Unknown handler: ${fn}`);
        }
      }
    });
});
