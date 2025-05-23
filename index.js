// Table of contents
const headings = Array.from(document.querySelectorAll("h2, h3, h4")).map(el => {
    const level = Number(el.tagName[1] || el.classList[0][1]);
    return { el, level };
})

const toc = document.getElementById("toc")

let currentLevel = 2
let currentParent = toc
let parentStack = [toc]

for (const { el, level } of headings) {
    const li = document.createElement("li")
    li.innerHTML = `<a href="#${el.id}" class = "link nav-link">${el.textContent}</a>`
    
    if (level > currentLevel) {
        const newOl = document.createElement("ol")
        newOl.setAttribute("type", "none")
        parentStack[parentStack.length - 1].lastElementChild.appendChild(newOl)
        parentStack.push(newOl)
        currentParent = newOl
    }
    else if (level < currentLevel) {
        const steps = currentLevel - level
        for (let i = 0; i < steps; i++) {
            parentStack.pop()
        }
        currentParent = parentStack[parentStack.length - 1]
    }
    
    currentParent.appendChild(li)
    currentLevel = level
}

const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        const id = entry.target.id
        const link = toc.querySelector(`a[href="#${id}"]`)
        if (entry.isIntersecting) {
            link.classList.add("active")
            const bounding = link.getBoundingClientRect()
            toc.scrollBy({
                top: bounding.top + toc.scrollTop - toc.offsetHeight / 2 + bounding.height / 2,
                behavior: "smooth"
            })
        } else {
            link.classList.remove("active")
        }
    }
}, {
    rootMargin: "-24px 0px -3% 0px"
})

headings.forEach(({ el }) => observer.observe(el))


// Navigation
const nav = document.querySelector('nav')
const navToggle = document.getElementById('nav-toggle')

const show = () => {
	showNav = true
	nav.style.display = 'block'
	navToggle.children[0].textContent = '✕'

	if (mobile) {
		document.querySelector('.fade').style.display = 'block'
		document.querySelector('.fade').style.opacity = '1'
		document.body.style.overflow = 'hidden'
	}
}

const hide = () => {	
	showNav = false
	nav.style.display = 'none'
	navToggle.children[0].textContent = '☰'

	if (mobile) {
		document.querySelector('.fade').style.display = 'none'
		document.querySelector('.fade').style.opacity = '0'
		document.body.style.overflow = 'auto'
	}
}

const mq = window.matchMedia("(max-width: 1200px)")
let mobile = mq.matches

let showNav = !mobile

window.addEventListener('resize', () => {
	mobile = mq.matches
})

navToggle.addEventListener('click', () => {
	showNav ? hide() : show()
})
showNav ? show() : hide()
document.querySelector('.fade').addEventListener('click', hide)

document.querySelectorAll('nav a').forEach(link => {
	link.addEventListener('click', () => {
		if (mobile) hide()
	})
})

// Replace kbd with "ctrl" to "⌘" on MacOS
if (navigator.userAgent.includes('Mac')) {
	document.querySelectorAll('kbd').forEach(kbd => {
		kbd.textContent = kbd.textContent.replace(/ctrl/i, '⌘')
	})
}

// Autodetect abbreviations (recursive)
function findAbbreviations(node) {
	if (node.nodeType === Node.TEXT_NODE) {
		const newText = node.nodeValue.replace(
			/(?<!\w)(?=.*[A-Z])([A-Z][A-Z0-9]{1,})(?!\w)/g,
			'<abbr>\$1</abbr>'
		)
		if (newText !== node.nodeValue) {
			const newNode = document.createElement('span')
			newNode.innerHTML = newText
			node.parentNode.replaceChild(newNode, node)
		}
	} else if (node.tagName !== 'ABBR') {
		node.childNodes.forEach(findAbbreviations)
	}
}

findAbbreviations(document.body)