/* eslint-env jquery */
$(() => {
  const views = {
    loading: {
      _view: $('#loading')
    },
    content: {
      _view: $('#content'),
      list: $('#session-list'),
      form: $('#session-add'),
      btn: $('#session-add-button'),
      input: $('#session-add-input')
    },
    detail: {
      _view: $('#detail'),
      name: $('#session-name'),
      audioBtn: $('#audio-ctl'),
      audioIcon: $('#audio-icon'),
      termBtn: $('#session-terminate'),
      homeBtn: $('#home'),
      volume: $('#volume')
    },
    error: {
      _view: $('#error')
    }
  }

  const state = {
    view: views.loading
  }

  // VIEW TRANSITIONS

  const hideAll = () => Object.keys(views).map((view) => views[view]._view.css('display', 'none'))

  const showContent = () => {
    updateList()
    updateAddButton(views.content.input.val())
    hideAll()
    views.content._view.css('display', 'flex')
    state.view = views.content
  }

  const showError = () => {
    hideAll()
    views.error._view.css('display', 'flex')
    state.view = views.error
  }

  const showDetail = (data) => {
    views.detail.name.text(data.name)
    if (data.id === state.socket.id) {
      views.detail.termBtn.show()
    } else {
      views.detail.termBtn.hide()
    }
    views.detail.volume.val(data.volume)
    updateAudioBtn(data.playing)
    state.detailData = data
    hideAll()
    views.detail._view.css('display', 'flex')
    state.view = views.detail
  }

  // SOCKET

  const socket = state.socket = new io() // eslint-disable-line new-cap, no-undef

  socket.on('disconnect', () => {
    console.log('web-socket connection down')
    showError()
  })

  socket.on('connect', () => {
    console.log(`web-socket connected, id = ${socket.id}`)
    socket.emit('data', { type: 'init' })
  })

  socket.on('data', (data) => {
    // console.log(`data received:\n${JSON.stringify(data, null, 2)}`)
    switch (data.type) {
      // initial load or after connection recovery
      case 'init':
        state.list = data.info
        showContent()
        break
      // new session created
      case 'create':
        state.list.push({ id: data.id, name: data.name, playing: false, volume: 50 })
        if (state.view === views.content) { updateList() }
        break
      // existing session removed
      case 'remove':
        state.list = state.list.filter(e => (e.id !== data.id))
        if (state.view === views.content) {
          updateList()
        } else if (state.view === views.detail && state.detailData.id === data.id) {
          showContent()
        }
        break
      // request to start audio playback
      case 'audio-play':
        const el1 = state.list.find((it) => (it.id === data.id))
        if (el1) { el1.playing = true }
        if (data.id === state.socket.id) {
          state.audio.currentTime = 0
          state.audio.play()
        }
        if (state.view === views.detail && state.detailData.id === data.id) {
          updateAudioBtn(true)
        }
        break
      // audio playback done
      case 'audio-done':
        const el2 = state.list.find((it) => (it.id === data.id))
        if (el2) { el2.playing = false }
        if (state.view === views.detail && state.detailData.id === data.id) {
          updateAudioBtn(false)
        }
        break
      // request to stop audio playback
      case 'audio-stop':
        const el3 = state.list.find((it) => (it.id === data.id))
        if (el3) { el3.playing = false }
        if (data.id === state.socket.id) { state.audio.pause() }
        if (state.view === views.detail && state.detailData.id === data.id) {
          updateAudioBtn(false)
        }
        break
      // request to change audio volume
      case 'volume-change':
        const el4 = state.list.find((it) => (it.id === data.id))
        if (el4) { el4.volume = data.volume }
        if (data.id === state.socket.id) { state.audio.volume = data.volume / 100 }
        if (data.from !== state.socket.id && state.view === views.detail && state.detailData.id === data.id) {
          views.detail.volume.val(data.volume)
        }
        break

      //
      default:
        console.log(`no handler for data type "${data.type}"`)
    }
  })

  // VIEWS / ELEMENTS / INTERACTIONS

  views.content.btn.click(() => {
    if (!state.btnClick) { return }
    if (!state.audio) {
      const audio = state.audio = $('#audio')[0]
      audio.src = 'bell.mp3'
      audio.volume = 0.5
      audio.play()
      audio.pause()
      audio.addEventListener('ended', onAudioDone, false)
    }
    state.socket.emit('data', { type: 'create', name: views.content.input.val() })
    views.content.form.hide()
  })

  views.content.input.on('input', (e) => updateAddButton(e.target.value))
  views.content.input.keyup((e) => { if (e.keyCode === 13) { views.content.btn.click() } })

  const updateAddButton = (text) => {
    const test = text.toLowerCase().trim()
    const names = state.list.map(item => item.name.toLowerCase().trim())
    const name = names.find((e) => (e === test))
    enableAddButton(test.length && !name)
  }

  const enableAddButton = (enabled) => {
    state.btnClick = enabled
    if (state.btnClick) {
      views.content.btn.css({
        backgroundColor: '#4caf50',
        opacity: 1,
        color: '#fff'
      })
    } else {
      views.content.btn.css({
        'background-color': '#fff',
        opacity: 0.25,
        color: '#444'
      })
    }
  }

  const onItemClick = (data) => {
    showDetail(data)
  }

  const updateList = () => {
    let local = false
    const nodes = state.list.map(el => {
      const node = document.createElement('li')
      const link = document.createElement('a')
      link.onclick = onItemClick.bind(link, el)
      const icon = document.createElement('i')
      icon.className = 'fa fa-bell'
      icon.style.paddingRight = '7px'
      link.appendChild(icon)
      const me = state.socket.id === el.id
      if (me) {
        local = true
        const icon2 = document.createElement('i')
        icon2.className = 'fa fa-download'
        icon2.style.paddingRight = '7px'
        link.appendChild(icon2)
      }
      const text = document.createTextNode(el.name)
      link.appendChild(text)
      node.appendChild(link)
      return node
    })
    views.content.list.empty()
    views.content.list.append(nodes)
    updateAddButton(views.content.input.val())
    if (!local) {
      views.content.form.show()
    } else {
      views.content.form.hide()
    }
  }

  views.detail.homeBtn.click(showContent)

  views.detail.termBtn.click(() => {
    views.detail.termBtn.hide()
    state.socket.emit('data', { type: 'remove' })
  })

  const updateAudioBtn = (playing) => {
    const icon = views.detail.audioIcon
    const btn = views.detail.audioBtn
    if (playing) {
      if (icon.hasClass('fa-play')) { icon.removeClass('fa-play'); btn.removeClass('play') }
      if (!icon.hasClass('fa-stop')) { icon.addClass('fa-stop'); btn.addClass('stop') }
    } else {
      if (icon.hasClass('fa-stop')) { icon.removeClass('fa-stop'); btn.removeClass('stop') }
      if (!icon.hasClass('fa-play')) { icon.addClass('fa-play'); btn.addClass('play') }
    }
  }

  views.detail.audioBtn.click(() => {
    const newState = !state.detailData.playing
    updateAudioBtn(newState)
    state.socket.emit('data', {
      type: newState ? 'audio-play' : 'audio-stop',
      id: state.detailData.id
    })
  })

  views.detail.volume.on('input', (e) => {
    state.socket.emit('data', {
      type: 'volume-change',
      id: state.detailData.id,
      volume: parseInt(e.target.value, 10)
    })
  })

  const onAudioDone = () => {
    state.socket.emit('data', { type: 'audio-done' })
  }
})
