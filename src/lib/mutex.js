const _awaitUnlock = async (mutex) => {
    // 잠금 상태가 아님 -> 즉시 resolve
    if (!mutex._locked) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      // 0.1초 후에 다시 확인
      setTimeout(() => {
        _awaitUnlock(mutex).then(() => resolve())
      }, 100)
    })
  }
  
  class Mutex {
    constructor() {
      this._locked = false
    }
  
    async lock() {
      // 잠금 상태가 풀릴 때 까지 대기
      await _awaitUnlock(this)
      this._locked = true
    }
  
    // 잠금 해제는 별도의 제약을 주지 않음.
    release() {
      this._locked = false
    }
  }
  
  export default Mutex