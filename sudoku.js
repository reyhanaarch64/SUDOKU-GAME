(function(window) {
    // inject css dari js
    const style = document.createElement('style');
    style.innerHTML = `
    .sd-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; backdrop-filter: blur(2px);
    opacity: 0; transition: opacity 0.2s;
    }
    .sd-modal {
    background: #fff; padding: 20px; width: 85%; max-width: 320px;
    transform: scale(0.9); transition: transform 0.2s;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    text-align: center; font-family: -apple-system, sans-serif;
    }
    .sd-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #333; }
    .sd-msg { font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.5; }
    .sd-input {
    width: 100%; padding: 10px; margin-bottom: 20px;
    border: 1px solid #ddd; outline: none; font-size: 16px;
    }
    .sd-btns { display: flex; gap: 10px; justify-content: center; }
    .sd-btn {
    flex: 1; padding: 10px; border: none; cursor: pointer;
    font-weight: 600; font-size: 14px;
    }
    `;
    document.head.appendChild(style);

    const sudoku = {
        // --- logika game ---

        // bikin papan baru
        generate: function(difficulty) {
            const board = Array.from({
                length: 9
            }, () => Array(9).fill(0));
            this._solveRecursive(board);
            const solved = JSON.parse(JSON.stringify(board));
            const puzzle = this._hideCells(board, difficulty);
            return {
                puzzle, solved
            };
        },

        // helper private buat backtracking
        _solveRecursive: function(board) {
            const empty = this._findEmpty(board);
            if (!empty) return true;

            const [r,
                c] = empty;
            const nums = [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9].sort(() => Math.random() - 0.5);

            for (let n of nums) {
                if (this._isValid(board, r, c, n)) {
                    board[r][c] = n;
                    if (this._solveRecursive(board)) return true;
                    board[r][c] = 0;
                }
            }
            return false;
        },

        _findEmpty: function(board) {
            for (let r = 0; r < 9; r++)
                for (let c = 0; c < 9; c++)
                if (board[r][c] === 0) return [r,
                c];
            return null;
        },

        _isValid: function(board, r, c, n) {
            for (let i = 0; i < 9; i++)
                if (board[r][i] === n || board[i][c] === n) return false;

            const sr = Math.floor(r/3)*3,
            sc = Math.floor(c/3)*3;
            for (let i = sr; i < sr+3; i++)
                for (let j = sc; j < sc+3; j++)
                if (board[i][j] === n) return false;

            return true;
        },

        _hideCells: function(board, diff) {
            const counts = {
                chill: 20,
                easy: 30,
                hard: 45,
                extreme: 55,
                god: 64
            };
            const limit = counts[diff] || 30;
            let copy = JSON.parse(JSON.stringify(board));
            let removed = 0;

            while (removed < limit) {
                let r = Math.floor(Math.random()*9);
                let c = Math.floor(Math.random()*9);
                if (copy[r][c] !== 0) {
                    copy[r][c] = 0;
                    removed++;
                }
            }
            return copy;
        },

        // --- fitur ui custom ---

        // sudoku.a("pesan", { color: "red", bg: "#000" })
        a: function(msg, opts = {}) {
            this._createModal('alert', msg, null, opts);
        },

        // sudoku.c("yakin?", (res) => { if(res) ... }, opts)
        c: function(msg, callback, opts = {}) {
            this._createModal('confirm', msg, callback, opts);
        },

        // sudoku.p("masukan nama", (val) => { ... }, opts)
        p: function(msg, callback, opts = {}) {
            this._createModal('prompt', msg, callback, opts);
        },

        _createModal: function(type, msg, cb, opts) {
            // default style
            const config = {
                bg: opts.bg || '#ffffff',
                color: opts.color || '#000000',
                btnColor: opts.btnColor || '#007aff',
                btnText: opts.btnText || '#ffffff',
                radius: opts.radius || '12px'
            };

            const overlay = document.createElement('div');
            overlay.className = 'sd-overlay';

            const modal = document.createElement('div');
            modal.className = 'sd-modal';
            modal.style.backgroundColor = config.bg;
            modal.style.color = config.color;
            modal.style.borderRadius = config.radius;

            const txt = document.createElement('div');
            txt.className = 'sd-msg';
            txt.textContent = msg;
            txt.style.color = config.color;
            modal.appendChild(txt);

            let inputEl = null;
            if (type === 'prompt') {
                inputEl = document.createElement('input');
                inputEl.className = 'sd-input';
                inputEl.style.borderRadius = '6px';
                if (opts.placeholder) inputEl.placeholder = opts.placeholder;
                modal.appendChild(inputEl);
            }

            const btnContainer = document.createElement('div');
            btnContainer.className = 'sd-btns';

            // tombol cancel (buat confirm/prompt)
            if (type !== 'alert') {
                const btnCancel = document.createElement('button');
                btnCancel.className = 'sd-btn';
                btnCancel.textContent = opts.cancelText || 'Batal';
                btnCancel.style.background = 'transparent';
                btnCancel.style.color = config.color;
                btnCancel.style.border = `1px solid ${config.color}`;
                btnCancel.style.borderRadius = '6px';
                btnCancel.onclick = () => {
                    this._close(overlay);
                    if (cb) cb(false); // return false kalo confirm
                };
                btnContainer.appendChild(btnCancel);
            }

            // tombol oke
            const btnOk = document.createElement('button');
            btnOk.className = 'sd-btn';
            btnOk.textContent = opts.okText || 'OK';
            btnOk.style.backgroundColor = config.btnColor;
            btnOk.style.color = config.btnText;
            btnOk.style.borderRadius = '6px';
            btnOk.onclick = () => {
                const val = inputEl ? inputEl.value: true;
                this._close(overlay);
                if (cb) cb(val);
            };
            btnContainer.appendChild(btnOk);

            modal.appendChild(btnContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // animasi masuk
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'scale(1)';
                if (inputEl) inputEl.focus();
            });
        },

        _close: function(el) {
            el.style.opacity = '0';
            el.querySelector('.sd-modal').style.transform = 'scale(0.9)';
            setTimeout(() => el.remove(),
                200);
        }
    };

    window.sudoku = sudoku;

})(window);