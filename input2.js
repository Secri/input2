// Eléments de paramétrage
			const input2Class = 'secriVisibleAttributes'; //Class de l'input visible
			const timing   = 2000; //Timing pour la suppression auto
			const separatorKey = 'Space';
			const keyboardRegex = /[a-zA-Z0-9\'\"\=\-\_ ]/; // array de Regex d'autorisation des touches du clavier
			const submitRegex = [/src=["']{1}.*/]; // array de Regex d'identification de chaînes interdites
			const inputMaxLength = 20; // Longueur maximale d'une chaîne dans l'input visible
			const ctaDeleteAll = 'Tout effacer';
			
			// Objet
			class Input2 {
			
				constructor(input, separator, keys, forbiddenStrings) {
				
					this.input            = input;
					this.separator        = separator;
					this.keys             = keys;
					this.forbiddenStrings = forbiddenStrings;

				}
				
				createInput2() { // Méthode qui crée les éléments HTML et les insère correctement dans le DOM
				
					let input2 = document.createElement('input');
					input2.setAttribute('type', 'text');
					input2.setAttribute('class', input2Class);
					
					if (Number.isInteger(inputMaxLength) && inputMaxLength > 0) {
					
						input2.setAttribute('maxlength', inputMaxLength.toString());
						
					}
					
					input2.setAttribute('value', this.input.value);
					
					// on met l'input 2 juste avant l'input caché dans le conteneur parent
					this.input.parentNode.prepend(input2);
					
					// On cible le parent par défaut de l'input visible, à priori un <td> par défaut sous Wordpress
					let getParentNode = input2.parentNode;
					
					// On crée le conteneur principal et on lui attribue une class
					let wrapper = document.createElement('div');
					wrapper.setAttribute('class', 'inputWrapper');
					
					// On crée le conteneur secondaire destiné à recevoir les mot-clés
					let keywordsWrapper = document.createElement('div');
			
					// On crée la div action pour la fonction deleteKeyword
					let actionDiv = document.createElement('div');
					actionDiv.setAttribute('class', 'action');
					let delButton = document.createElement('div');
					delButton.textContent = ctaDeleteAll;
					actionDiv.appendChild(delButton);
					
					// On remplace l'input par le conteneur dans l'élément parent et on met l'input dans le wrapper
					getParentNode.replaceChild(wrapper, input2);
					wrapper.appendChild(keywordsWrapper);
					wrapper.appendChild(actionDiv);
					keywordsWrapper.appendChild(input2);
					
					//on met le tout dans un conteneur générique indépendant
					const globalContainer = document.createElement('div');
					this.input.parentNode.prepend(globalContainer);
					globalContainer.appendChild(wrapper);
					globalContainer.appendChild(this.input);
					
					//On lance l'isolation des mots clés
					this.includeKeywords(this.getInitialValue());
					
					//On assigne le gestionnaire séparateur dans l'input
					this.handleSeparatorInput();
					
					//On assigne l'écouteur des input clavier
					this.handleKeyboard();
					
					//On ajoute la gestion du bouton delete all
					this.deleteAll();
					
				}
				
				getInitialValue() { //Récupère la value de l'input2 sous forme de tableau
				
					let target = this.input.previousElementSibling.firstElementChild.lastElementChild;
					
					return target.value.split(' ');
				
				}
				
				includeKeywords(array, autoDel='non') {
				
					let visibleInput = this.input.previousElementSibling.firstElementChild.lastElementChild;
				
					for (const element of array.reverse()) {
					
						if (element != '') {
						
							let cartouche = document.createElement('div');
							
							if (autoDel === 'yes') {
							
								cartouche.setAttribute('class', 'srcError');
							
							}
							
							cartouche.textContent = element.toLowerCase();
							
							let fermer = document.createElement('i');
							
							cartouche.appendChild(fermer);
							
							this.input.previousElementSibling.firstElementChild.prepend(cartouche);
							
						}
					
					}
					
					visibleInput.value = ''; // Après avoir injecté les mots clés on efface la value de l'input visible
					this.deleteListener();
					this.handleButtonVisibility();
					
					if (autoDel == 'yes') {
					
						setTimeout( () => { this.input.previousElementSibling.firstElementChild.querySelectorAll('.srcError').forEach( (element) => element.remove()); this.handleButtonVisibility(); }, timing );
				
					} else {
					
						this.input.value = this.pushToHiddenInput();
					
					}
					
				}
				
				pushToHiddenInput() {
				
					let keyWords = this.input.previousElementSibling.firstElementChild.querySelectorAll('div');
					
					let tempArray = []; //Voir pour trouver un moyen plus sexy de faire le job !
					
					for (const element of keyWords) {
					
						tempArray.push(element.textContent);
					
					}
					
					return tempArray.join(' ');
				
				}
				
				deleteListener() {
				
					let buttonsCollection = this.input.previousElementSibling.firstElementChild.querySelectorAll('div i');
					
					for (const element of buttonsCollection) {
					
						element.addEventListener('click', (event)=> { //On utilise un fonction flèche pour ne pas sortir du contexte de l'objet
						
							event.target.parentElement.remove();
							
							let getHiddenValue = this.input.value.split(' ');
							
							let newHiddenValue = getHiddenValue.filter( (word) => word != event.target.parentElement.textContent );
							
							this.input.value = newHiddenValue.join(' ');
							
							this.handleButtonVisibility();
						
						});
						
					}
				
				}
				
				handleKeyboard() {
				
					this.input.previousElementSibling.firstElementChild.lastElementChild.addEventListener('keydown', (event)=> { //On utilise un fonction flèche pour ne pas sortir du contexte de l'objet
					
						if ( !event.key.match(this.keys) ) { //si l'entrée au clavier matche le séparateur
							
							event.preventDefault();  
							
						}
						
						if (event.code === this.separator && event.target.value.length > 0) {
						
							for (const regex of this.forbiddenStrings) {
								
								if ( event.target.value.match(regex) || this.checkRedundant(event.target.value) ) { //
									
									this.includeKeywords([event.target.value], 'yes');
									
								} else {
								
									this.includeKeywords([event.target.value]);
								
								}
								
							}
						
						}
					
					});
					
				}
				
				handleSeparatorInput() {
				
					this.input.previousElementSibling.firstElementChild.lastElementChild.addEventListener('input', (event)=> { //On utilise un fonction flèche pour ne pas sortir du contexte de l'objet
					
						if (event.target.value === ' ') {
						
							event.target.value = '';
							
							return;
							
						}
					
					});
				
				}
				
				checkRedundant(string) {
				
					const keywordsCollection = this.input.previousElementSibling.firstElementChild.querySelectorAll('div');
					
					for (const element of keywordsCollection) {
					
						if (string === element.textContent) {
						
							return true;
							
						}
						
					}
					
					return false;
				
				}
				
				deleteAll() {
				
					this.input.previousElementSibling.lastElementChild.lastElementChild.addEventListener('click', (event)=> {
					
					const keywordsCollection = this.input.previousElementSibling.firstElementChild.querySelectorAll('div');
					
						for (const element of keywordsCollection) {
						
							element.remove();
						
						}
						
						this.input.value = '';
						
						this.handleButtonVisibility();
										
					});
				
				}
				
				handleButtonVisibility() {
				
					const keywordsCollection = this.input.previousElementSibling.firstElementChild.querySelectorAll('div');
					
					if ( keywordsCollection.length > 1) {
					
						this.input.previousElementSibling.lastElementChild.lastElementChild.style.display = 'block';
						
					} else {
					
						this.input.previousElementSibling.lastElementChild.lastElementChild.style.display = 'none';
						
					}
				
				}
				
			}
			
			document.addEventListener('DOMContentLoaded', function() {
				
				let inputs = document.querySelectorAll('.secriSubmitAttributes');
				
				let instances = {};
				
				let inc = 0;
				
				for (const elt of inputs) {
				
					inc++;
					instances[inc] = new Input2(elt, separatorKey, keyboardRegex, submitRegex);
					instances[inc].createInput2();
				
				}
				
			});
