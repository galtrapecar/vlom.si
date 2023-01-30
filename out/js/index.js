function init_color_selection() {

    let last_checked = document.getElementsByClassName('icon bela')[0];

    const options = document.querySelectorAll('.option')

    for (const option of options) {
        option.addEventListener('click', () => {
            const icon = option.querySelector('.icon')
            if (!icon) return
            const type = icon.classList.item(1)
            if (!type) return

            if (last_checked && last_checked != 'undefined') last_checked.classList.remove('checked')
            icon.classList.add('checked')
            last_checked = icon

            for (const color of document.querySelectorAll('.selected-color')) {
                color.classList.add('not-displayed')
            }
            document.querySelector(`#${type}`).classList.remove('not-displayed')
        })
    }
}

function init_shake_animation() {
    const logo = document.querySelector('#kaindl')
    const text = document.querySelector('#keindl-text')

    let paused = false
    let flag = true
    const animation = setInterval(() => {
        if (paused) return
        flag ? logo.style.animationPlayState = 'running' : logo.style.animationPlayState = 'paused'
        flag = flag ? false : true

        setTimeout(() => {
            logo.style.animationPlayState = 'paused'
        }, 1000)
    }, 4000)

    document.addEventListener('DOMContentLoaded', () => {
        console.log(1);
        logo.style.animationName = 'shake'
        logo.syle.animationDuation = '1s'
        logo.stytle.animationTimingF
        logo.style.animationPlayState = ''
    })

    logo.addEventListener('mouseenter', () => {
        paused = true
        logo.style.animation = ''
        logo.style.animationPlayState = 'paused'
        logo.classList.add('hovered')
        text.style.maxWidth = '30vw'
    })

    logo.addEventListener('mouseleave', () => {
        paused = false
        logo.classList.remove('hovered')
        logo.addEventListener('transitionend', () => {
            logo.style.animation = 'shake 1s linear infinite'
            logo.style.animationPlayState = 'paused'
        })
        
        text.style.maxWidth = '0'
    })
}

(() => {
    init_color_selection()
    init_shake_animation()
})()