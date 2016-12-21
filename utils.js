let logging = true

const leftPad = (str = '', num = 2, pad = '0') => {
  let s = '' + str;
  while (s.length < num) { s = pad + s }
  return s
}

const now = () => {
  const t = new Date()
  return `[${t.getFullYear()}-${leftPad(t.getMonth()+1)}-${leftPad(t.getDate())} ${leftPad(t.getHours())}:${leftPad(t.getMinutes())}:${leftPad(t.getSeconds())}.${leftPad(t.getMilliseconds(),3)}]`
}

const log = (...args) => {
  if (!logging) { return }
  args.unshift(now())
  console.log.apply(console, args)
}

const nlog = (...args) => {
  if (!logging) { return }
  console.log.apply(console, args)
}

const turnLog = (on = true) => logging = on

module.exports = { log, nlog, turnLog };
