import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import JSZip from 'jszip'

const width = window.innerWidth
const height = window.innerHeight + (window.innerHeight / 3) * 0.9

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = false
controls.enableZoom = false
controls.minDistance = 1.0
controls.maxDistance = 3.0
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: null,
    RIGHT: null
}
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.ROTATE
}

let gltf_scene
let selected_object
let sprite_group = new THREE.Group()
let looking_at
let looking_at_sprite = false

function preload() {

    function zip() {
        let url = './gltf/main.zip'

        var promise = JSZip.external.Promise

        var baseUrl = 'blob:' + THREE.LoaderUtils.extractUrlBase(url)

        return new promise(function (resolve, reject) {

            var loader = new THREE.FileLoader(THREE.DefaultLoadingManager)
            loader.setResponseType('arraybuffer')
            loader.load(url, resolve, () => { }, reject)

        }).then(function (buffer) {

            return JSZip.loadAsync(buffer)

        }).then(function (zip) {

            var fileMap = {}

            var pendings = []

            for (var file in zip.files) {

                var entry = zip.file(file)

                if (entry === null) continue

                pendings.push(entry.async('blob').then(function (file, blob) {

                    fileMap[baseUrl + file] = URL.createObjectURL(blob)

                }.bind(this, file)))

            }

            return promise.all(pendings).then(function () {

                return fileMap

            })

        }).then(function (fileMap) {

            return fileMap

        })
    }

    zip().then(file => {

        let url = ''

        for (const key in file) {
            url = file[key]
        }
        const loader = new GLTFLoader()

        loader.load(
            url,

            function (gltf) {

                gltf_scene = gltf.scene
                gltf_scene.position.y = -1
                scene.add(gltf.scene)

                init()
            },
            function (xhr) {

                // document.querySelector('.load-bar').style.width = `${(xhr.loaded / xhr.total * 100)}%`
                // if ((xhr.loaded / xhr.total * 100) >= 100) {
                //     document.querySelector('.load-wrap').classList.add('close')
                //     setTimeout(() => {
                //         document.querySelector('#three-info-load').remove()
                //     }, 220)
                // }

            },
            function (error) {

                console.log('An error happened')

            }
        )
    })

}

function init() {

    renderer.setSize(width, window.innerHeight + (window.innerHeight / 3))
    renderer.setPixelRatio = window.devicePixelRatio
    renderer.outputEncoding = THREE.sRGBEncoding
    // renderer.domElement.style.backgroundImage = "url(data:image/pngbase64,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)"
    document.querySelector('#three-info').appendChild(renderer.domElement)
    renderer.domElement.addEventListener('mousedown', () => {
        if (document.querySelector('#tutorial'))
            document.querySelector('#tutorial').remove()
    })
    
    camera.position.z = -3.0
    camera.position.y = 0
    controls.update()

    // ------------------------------------------------------------- HDRI SETUP ---------------------------------------------------------------------- //

    new RGBELoader()
        .setPath('./gltf/')
        .load('main.hdr', function (texture) {

            texture.mapping = THREE.EquirectangularReflectionMapping

            scene.environment = texture

        })

    // ------------------------------------------------------------- LIGHT SETUP ---------------------------------------------------------------------- //

    let light = new THREE.AmbientLight(0xF0F0F0)
    light.intensity = 0.8
    scene.add(light)

    // ------------------------------------------------------------- SPRITES SETUP -------------------------------------------------------------------- //


    const sprites = {
        izolacija: {
            name: 'izolacija',
            position: { x: .25, y: .65, z: -.05 },
            scale: .05
        },
        slepi_zatici: {
            name: 'slepi_zatici',
            position: { x: .5, y: .27, z: 0 },
            scale: .05
        },
        zatici: {
            name: 'zatici',
            position: { x: -.515, y: 0, z: 0 },
            scale: .05
        },
        dodatna_zapora: {
            name: 'dodatna_zapora',
            position: { x: -.375, y: .55, z: -.05 },
            scale: .05
        },
        panti: {
            name: 'panti',
            position: { x: .52, y: -.7386, z: 0.02 },
            scale: .05
        },
        obloga: {
            name: 'obloga',
            position: { x: -.016, y: -.3, z: -0.08 },
            scale: .05
        },
        kukalo: {
            name: 'kukalo',
            position: { x: -.004, y: .53, z: 0.08 },
            scale: .05
        },
        mangan: {
            name: 'mangan',
            position: { x: -.25, y: -.069, z: 0.08 },
            scale: .05
        },
    }

    function createSprites(sprites) {
        function createMap() {
            let map = new THREE.TextureLoader().load('./img/info.png')
            map.minFilter = THREE.LinearFilter
            map.magFilter = THREE.LinearFilter
            return map
        }

        for (const key in sprites) {
            let map = createMap()
            let material = new THREE.SpriteMaterial({ map: map, color: 0xffffff, opacity: .5 })
            let sprite = new THREE.Sprite(material)
            sprite.scale.x = sprites[key].scale
            sprite.scale.y = sprites[key].scale
            sprite.position.x = sprites[key].position.x
            sprite.position.y = sprites[key].position.y
            sprite.position.z = sprites[key].position.z
            sprite.name = sprites[key].name
            sprite.type = 'Sprite'
            sprite_group.add(sprite)
        }
        return sprite_group
    }

    scene.add(createSprites(sprites))

    // ------------------------------------------------------------- TUTORIAL SETUP ---------------------------------------------------------------------- //

    function tutorial_setup() {
        document.querySelector('.tutorial-wrap').style.display = 'grid'
    }

    //tutorial_setup()

    // ------------------------------------------------------------- RAYCASTING SETUP ---------------------------------------------------------------------- //

    const three_popup = document.querySelector('.three-popup')

    function onPointerMove(event) {
        const rect = renderer.domElement.getBoundingClientRect()

        pointer.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1
        pointer.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1

        event.preventDefault()

        if (selected_object) {
            selected_object.material.opacity = .5
            document.body.style.cursor = ''
            looking_at_sprite = false
            selected_object = null
        }

        const intersects = getIntersects()

        if (intersects.length > 0) {

            if (window.innerWidth > 1024 && !document.querySelector('#tutorial')) {
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.ROTATE,
                    RIGHT: null
                }
                controls.enableZoom = true
                controls.update()
            }
            

            const res = intersects.filter(function (res) {

                return res && res.object

            })[0]

            if (res && res.object && res.object.type == 'Sprite') {
                selected_object = res.object
                selected_object.material.opacity = .8
                document.body.style.cursor = 'pointer'

                looking_at_sprite = true
                looking_at = selected_object.name
            }

        } else {
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: null,
                RIGHT: null
            }
            controls.enableZoom = false
            controls.update()
        }

    }

    const SpriteRaycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    function getIntersects() {
        SpriteRaycaster.setFromCamera(pointer, camera)
        return SpriteRaycaster.intersectObject(scene)
    }

    let first_popup = true
    let animating_popup = false
    let previous_popup = null
    function onClick() {
        let _looking_at = null
        if (!looking_at_sprite) return
        if (animating_popup) return

        try {
            _looking_at = document.querySelector(`.${looking_at}`)
        } catch (ignore) {}

        if (_looking_at === null) return
        if (previous_popup === _looking_at) return

        three_popup.style.opacity = 1

        if (!first_popup) {
            previous_popup.classList.remove('show')
            previous_popup.classList.add('hide')
            first_popup = false
            animating_popup = true
            setTimeout(() => {
                _looking_at.classList.remove('hide')
                _looking_at.classList.add('show')
                setTimeout(() => animating_popup = false, 700)
            }, 1000)
            previous_popup = document.querySelector(`.${looking_at}`)
            return
        }

        previous_popup = _looking_at
        first_popup = false
        _looking_at.classList.add('show')
    }

    window.addEventListener('pointermove', onPointerMove, false)
    window.addEventListener('click', onClick, false)

    // ------------------------------------------------------------- RENDER LOOP SETUP ---------------------------------------------------------------------- //

    function animate() {
        requestAnimationFrame(animate)

        renderer.render(scene, camera)
    }
    animate()

    // ------------------------------------------------------------- HANDLE RESIZE ---------------------------------------------------------------------- //

    window.addEventListener('resize', onWindowResize, false)

    function onWindowResize() {

        const height = window.innerHeight + (window.innerHeight / 3)

        camera.aspect = window.innerWidth / height
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, height)

    }
}

document.addEventListener('DOMContentLoaded', preload)

// -------------------------------------------------------------------------------------------------------