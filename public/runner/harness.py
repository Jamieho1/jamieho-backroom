# Interview Prep test harness (TKT-29). Runs inside a fresh Pyodide worker per Run/Submit.
# Python-level isolation is "concealed, not secret": the real network barrier is the worker's CSP + stubbed JS APIs.
import sys, builtins, time, json, traceback

_BLOCKED_ROOTS = {"js", "pyodide", "pyodide_js", "micropip", "_pyodide", "pyodide_http", "ctypes", "_ctypes", "socket", "_socket", "ssl", "urllib", "http", "subprocess"}

for _name in list(sys.modules):
    if _name.split(".")[0] in _BLOCKED_ROOTS:
        del sys.modules[_name]

_real_import = builtins.__import__


def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
    if level == 0 and name.split(".")[0] in _BLOCKED_ROOTS:
        raise ImportError(f"module '{name}' is not available in the interview sandbox")
    return _real_import(name, globals, locals, fromlist, level)


builtins.__import__ = _guarded_import

_PRELUDE = """
from typing import *
import collections, heapq, math, bisect, itertools, functools, re, string, random
from collections import deque, defaultdict, Counter, OrderedDict
from heapq import heappush, heappop, heapify, nlargest, nsmallest
from functools import lru_cache, cache
from bisect import bisect_left, bisect_right, insort

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def to_list(arr, pos=-1):
    \"\"\"[1,2,3] -> ListNode chain; pos >= 0 links the tail back to that index (a cycle).\"\"\"
    head = None
    nodes = []
    for v in arr:
        nodes.append(ListNode(v))
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if nodes and pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0] if nodes else None

def from_list(head, limit=100000):
    out = []
    while head is not None and len(out) < limit:
        out.append(head.val)
        head = head.next
    return out

def to_tree(arr):
    \"\"\"Level-order list with None for gaps (LeetCode format) -> TreeNode.\"\"\"
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = [root]
    i = 1
    while q and i < len(arr):
        node = q.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            q.append(node.right)
        i += 1
    return root

def from_tree(root):
    out = []
    q = [root]
    while q:
        node = q.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def replay(ns, ops, params):
    \"\"\"LeetCode design-problem format: ["MinStack","push",...], [[],[1],...] -> outputs (None for void calls).\"\"\"
    obj = ns[ops[0]](*params[0])
    out = [None]
    for op, p in zip(ops[1:], params[1:]):
        out.append(getattr(obj, op)(*p))
    return out
"""


_SAFE = {k: getattr(builtins, k) for k in ("range", "len", "list", "dict", "tuple", "set", "str", "int", "float", "bool", "min", "max", "abs", "sum", "sorted", "reversed", "enumerate", "zip", "chr", "ord", "True", "False", "None")}


def _canon(x, unordered):
    if unordered and isinstance(x, (list, tuple)):
        return sorted((_canon(i, False) for i in x), key=repr)
    return x


def _short(x, n=300):
    s = repr(x)
    return s if len(s) <= n else s[: n - 1] + "…"


def run_tests(code, method, tests_json, extra_json="{}"):
    tests = json.loads(tests_json)
    extra = json.loads(extra_json or "{}")
    ns = {"__name__": "__main__"}
    out = {"compile_error": None, "results": []}
    driver = None
    try:
        exec(_PRELUDE, ns)
        if extra.get("prelude"):
            exec(compile(extra["prelude"], "prelude.py", "exec"), ns)
        exec(compile(code, "solution.py", "exec"), ns)
        if extra.get("driver"):
            dns = dict(ns)
            exec(compile(extra["driver"], "driver.py", "exec"), dns)
            driver = dns["run"]
        else:
            cls = ns.get("Solution")
            if cls is None:
                raise NameError("class Solution is not defined")
            getattr(cls(), method)
    except Exception:
        out["compile_error"] = traceback.format_exc(limit=3)[-1500:]
        return json.dumps(out)

    for t in tests:
        r = {"id": t["id"], "kind": t["kind"], "visible": t["visible"]}
        try:
            args = eval(t["input"], {"__builtins__": _SAFE})
            # "" = no expected value (performance-only test: correctness is covered by functional tests).
            has_expected = t["expected"] != ""
            expected = eval(t["expected"], {"__builtins__": _SAFE}) if has_expected else None
            t0 = time.perf_counter()
            if driver is not None:
                got = driver(ns, args)
            else:
                got = getattr(ns["Solution"](), method)(*args)
            ms = (time.perf_counter() - t0) * 1000
            r["ms"] = round(ms, 2)
            unordered = t.get("compare") == "unordered"
            ok = (not has_expected) or _canon(got, unordered) == _canon(expected, unordered)
            limit = t.get("time_limit_ms")
            if ok and t["kind"] == "performance" and limit is not None and ms > limit:
                r["status"] = "too_slow"
            else:
                r["status"] = "pass" if ok else "fail"
            r["got"] = _short(got)
            r["expected"] = _short(expected) if has_expected else None
        except Exception as e:
            r["status"] = "error"
            r["error"] = f"{type(e).__name__}: {e}"[:500]
        out["results"].append(r)
    return json.dumps(out)


