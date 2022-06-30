Gushio - CHANGELOG
---
### [0.7.1](https://github.com/Forge-Srl/gushio/compare/release/0.7.0...release/0.7.1) (2022-06-30)


### Features

* `--trace` flag ([34570d1](https://github.com/Forge-Srl/gushio/commit/34570d15b3e9e612c9a14ba60b05ad7c2a10446f))


### Bug Fixes

* fetchWrapper again ([f0aa977](https://github.com/Forge-Srl/gushio/commit/f0aa9778e01d758b1723ba3bbbf9886816faaf81))
* fetchWrapper on Node 18 ([e6043b2](https://github.com/Forge-Srl/gushio/commit/e6043b21bde9e4d5505cc06572e3f8c0d380736c))
* files with test coverage ([7c3f3ed](https://github.com/Forge-Srl/gushio/commit/7c3f3edbccefef66d0ce8e27210b62963ff4cf83))
* string patches after sub-script execution ends ([0a16638](https://github.com/Forge-Srl/gushio/commit/0a16638e79f8804f74e4a376a1554d92a86e5e22))

## [0.7.0](https://github.com/Forge-Srl/gushio/compare/release/0.6.0...release/0.7.0) (2022-03-31)


### ⚠ BREAKING CHANGES

* dependencies `require()` has been replaced with `await gushio.import()`

### Features

* `gushio.version` ([0309d4f](https://github.com/Forge-Srl/gushio/commit/0309d4fe8337c4bb4f03e44abd5a444324d6d19e))
* timer global object ([f121754](https://github.com/Forge-Srl/gushio/commit/f1217547880644fd226294e0d2aa44614882d31e))


### Bug Fixes

* link changed ([c9536b8](https://github.com/Forge-Srl/gushio/commit/c9536b81915319c942161b0a9b3c13cb8b935349))
* package entry point resolution on linux ([3bf968f](https://github.com/Forge-Srl/gushio/commit/3bf968fce7ca6e6ca0bd536ca5a668b96e7cceeb))
* polyfill AbortController ([b4e9460](https://github.com/Forge-Srl/gushio/commit/b4e94609a70f04ff6511ff1ac0677d7d83e170e5))
* uniform behaviour in CJS and ESM ([6bd5c65](https://github.com/Forge-Srl/gushio/commit/6bd5c658f79a343d37d063168d80bf4303fc810f))


* code is ESM ([e87c01b](https://github.com/Forge-Srl/gushio/commit/e87c01b0742ec22401d2bbb8d2fd6d5a1c4c6fe5))

## [0.6.0](https://github.com/Forge-Srl/gushio/compare/release/0.5.0...release/0.6.0) (2022-01-31)


### Features

* add footer note on help command ([484cdcc](https://github.com/Forge-Srl/gushio/commit/484cdcca74134ceee3877a6898f738207cb44034))
* add YAML global object ([7110a31](https://github.com/Forge-Srl/gushio/commit/7110a31910644513abe4cb6174278d41a4f2c713))
* node `path` module available from `fs.path` ([54fbfb9](https://github.com/Forge-Srl/gushio/commit/54fbfb94875c0840a268b7391c35f624cf208f40))

### 0.5.0 (2022-01-26)


### Features

* after help message ([71d5989](https://github.com/Forge-Srl/gushio/commit/71d5989f5df13327b9488dcf41a7a613f24f2c1d))
* allow throwing strings instead of errors ([13a13f2](https://github.com/Forge-Srl/gushio/commit/13a13f28e8af19646d95651367d98756df08178a))
* ansi-colors in String prototype ([6b7af24](https://github.com/Forge-Srl/gushio/commit/6b7af24f7a8e30b7b3cfc2fa8cd6012d0587d09a))
* change gushio folder ([5a5d379](https://github.com/Forge-Srl/gushio/commit/5a5d379eeb2fd431c75a08b8e2a6c7ca6aca7099))
* clean run ([edfe895](https://github.com/Forge-Srl/gushio/commit/edfe8957748947a48965972902acef1bb88350d4))
* console spinner ([bd43a67](https://github.com/Forge-Srl/gushio/commit/bd43a67c6400f2126fcf4f1820d70f8b797efee7))
* custom console ([dce2352](https://github.com/Forge-Srl/gushio/commit/dce2352e1f19cfc583fd6244787c10f2983a1df3))
* download dependencies ([c52f892](https://github.com/Forge-Srl/gushio/commit/c52f892979c4b9c75bad6b3e218e36c5a0a57c89))
* enquirer from console.input ([e3d5e20](https://github.com/Forge-Srl/gushio/commit/e3d5e201ae5ae52bbf44f293706bfb6c72f9038b))
* first raw implementation ([bcd498d](https://github.com/Forge-Srl/gushio/commit/bcd498d6a82d41ff3c5f55d326e5e3c0a9795ac7))
* glob function in fs ([caf1a11](https://github.com/Forge-Srl/gushio/commit/caf1a11f462aa295c51468aad097fc548a00d68a))
* global fetch ([286a55a](https://github.com/Forge-Srl/gushio/commit/286a55aa0a56fba5864717be996d622383a0ec85))
* global fs ([e01787a](https://github.com/Forge-Srl/gushio/commit/e01787ab9a33d5a0cd2cfe99299e50060d4fcb7e))
* gushio global with run script function ([64f3d53](https://github.com/Forge-Srl/gushio/commit/64f3d5367f4efe3c23792358b24475528a6d151a))
* handle choices and env in arguments and options ([f74d559](https://github.com/Forge-Srl/gushio/commit/f74d5594ead6ae154bd54ca4125979c5497ec4d0))
* handle status code of remote script ([13463ea](https://github.com/Forge-Srl/gushio/commit/13463ea7e9bfd215ff66b512484545cd4883ab55))
* handle syntax errors in script ([c50b1b4](https://github.com/Forge-Srl/gushio/commit/c50b1b4c33e8208c7f1f77e415b22018959d8ed5))
* optimize prehook when there are no deps declared ([51eafd3](https://github.com/Forge-Srl/gushio/commit/51eafd3859cf30e4c7d56b025f6d532a8ef54051))
* patched require function when importing inside script run function ([54eb724](https://github.com/Forge-Srl/gushio/commit/54eb7241d90956d304a159b3dbc2049b6c2beda0))
* remote script execution ([6ee322c](https://github.com/Forge-Srl/gushio/commit/6ee322cb9304bc5c2e4f5a5c167cd57d2a936358))
* script as argument and options pass-through ([5c8355f](https://github.com/Forge-Srl/gushio/commit/5c8355f4182fb68e99cff3d791ee5fee25576417))


### Bug Fixes

* acceptance_sample_1 ([926a614](https://github.com/Forge-Srl/gushio/commit/926a61483d1e45a25adb8808901c7ed06f4e754f))
* add missing script module filename ([c7cbd5b](https://github.com/Forge-Srl/gushio/commit/c7cbd5b59b41bf18e773425dd9b2ecb3201ea065))
* dependency loading ([9a6b5e5](https://github.com/Forge-Srl/gushio/commit/9a6b5e557ad0d7234af767211afb6bef5b9a37d6))
* folders handling ([3ebb350](https://github.com/Forge-Srl/gushio/commit/3ebb350b098af2a778f8dc0b97f077ff35989bd9))
* patched require ([ccc0632](https://github.com/Forge-Srl/gushio/commit/ccc0632866ae456c713da30ef71746a20019272f))
* useless replaceAll with global regex ([48a2c0c](https://github.com/Forge-Srl/gushio/commit/48a2c0c733c8040844df5a2f0c7ddd8d2a5dc506))
