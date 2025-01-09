# Node stdin hang bug demo

Run with:
```
node main
```

Process tree required to trigger bug:
```
  main.js - launches child with piped stdin
    middle.js - launches children with inherited stdin
      grandchild1.js - attaches a listener to stdin
      (1s later) grandchild2.js - imports node:process and then hangs
```

Hang does not occur if any of these happen:
* `grandchild1` is launched _before_ `grandchild2`
* `middle`'s `stdin` is not `pipe`d to `main`
* `grandchild1`'s or `grandchild2`'s `stdin` is not `inherit`
* `grandchild1` exits (causes `grandchild2` to get unstuck)

Hang still occurs if:
* `grandchild1` is anything that reads from stdio (e.g. `cmd /c pause`)

Tested on (all fail):
* Node v12...v22
* Windows 10, 11

Hung process call stack (`SetNamedPipeHandleState(stdin)`):
```
NtSetInformationFile()
SetNamedPipeHandleState(pipeHandle, PIPE_READMODE_BYTE | PIPE_WAIT)
node.exe!uv__set_pipe_handle(loop=0x00007ff71d27f130, handle=0x000001c0c83367f0, pipeHandle=0x0000000000000278, fd=-1, duplex_flags=49152)
	at deps\uv\src\win\pipe.c(482)
node.exe!uv_pipe_open(pipe=0x000001c0c83367f0, file=0)
	at deps\uv\src\win\pipe.c(2480)
node.exe!node::PipeWrap::Open(args={...})
	at src\pipe_wrap.cc(209)
node.exe!Builtins_CallApiCallbackGeneric()
	at out\Release\obj\v8_snapshot\embedded.S(4265)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_InterpreterPushArgsThenFastConstructFunction()
	at out\Release\obj\v8_snapshot\embedded.S(4038)
node.exe!Builtins_ConstructHandler()
	at out\Release\obj\v8_snapshot\embedded.S(56237)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_GetPropertyWithReceiver()
	at out\Release\obj\v8_snapshot\embedded.S(24522)
node.exe!Builtins_ReflectGet()
	at out\Release\obj\v8_snapshot\embedded.S(41510)
00007ff69938aaf7()
00007ff69938acf4()
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_JSEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3658)
node.exe!Builtins_JSEntry()
	at out\Release\obj\v8_snapshot\embedded.S(3616)
[Inline Frame] node.exe!v8::internal::GeneratedCode<unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,__int64,unsigned __int64 * *>::Call()
	at deps\v8\src\execution\simulator.h(178)
node.exe!v8::internal::`anonymous namespace'::Invoke(isolate=0x000001c0c82c1000, params={...})
	at deps\v8\src\execution\execution.cc(420)
node.exe!v8::internal::Execution::Call(isolate=0x000001c0c82c1000, callable, receiver, argc=0, argv=0x0000000000000000)
	at deps\v8\src\execution\execution.cc(506)
node.exe!v8::Function::Call(context, recv={...}, argc=0, argv=0x0000000000000000)
	at deps\v8\src\api\api.cc(5484)
node.exe!node::loader::ModuleWrap::SyntheticModuleEvaluationStepsCallback(context={...}, module)
	at src\module_wrap.cc(948)
node.exe!v8::internal::SyntheticModule::Evaluate(isolate=0x000001c0c82c1000, module={...})
	at deps\v8\src\objects\synthetic-module.cc(108)
node.exe!v8::internal::Module::Evaluate(isolate=0x000001c0c82c1000, module={...})
	at deps\v8\src\objects\module.cc(284)
node.exe!v8::Module::Evaluate(context)
	at deps\v8\src\api\api.cc(2461)
[Inline Frame] node.exe!node::loader::ModuleWrap::Evaluate::__l2::<lambda_1>::operator()()
	at src\module_wrap.cc(562)
node.exe!node::loader::ModuleWrap::Evaluate(args={...})
	at src\module_wrap.cc(578)
node.exe!Builtins_CallApiCallbackGeneric()
	at out\Release\obj\v8_snapshot\embedded.S(4265)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_AsyncFunctionAwaitResolveClosure()
	at out\Release\obj\v8_snapshot\embedded.S(11765)
node.exe!Builtins_PromiseFulfillReactionJob()
	at out\Release\obj\v8_snapshot\embedded.S(40771)
node.exe!Builtins_RunMicrotasks()
	at out\Release\obj\v8_snapshot\embedded.S(9703)
node.exe!Builtins_JSRunMicrotasksEntry()
	at out\Release\obj\v8_snapshot\embedded.S(3644)
[Inline Frame] node.exe!v8::internal::GeneratedCode<unsigned __int64,unsigned __int64,v8::internal::MicrotaskQueue *>::Call()
	at deps\v8\src\execution\simulator.h(178)
node.exe!v8::internal::`anonymous namespace'::Invoke(isolate=0x000001c0c82c1000, params={...})
	at deps\v8\src\execution\execution.cc(436)
node.exe!v8::internal::`anonymous namespace'::InvokeWithTryCatch(isolate=0x000001c0c82c1000, params={...})
	at deps\v8\src\execution\execution.cc(475)
node.exe!v8::internal::Execution::TryRunMicrotasks(isolate=0x000001c0c82c1000, microtask_queue=0x000001c0c6709da0)
	at deps\v8\src\execution\execution.cc(578)
node.exe!v8::internal::MicrotaskQueue::RunMicrotasks(isolate=0x000001c0c82c1000)
	at deps\v8\src\execution\microtask-queue.cc(184)
[Inline Frame] node.exe!v8::internal::MicrotaskQueue::PerformCheckpointInternal()
	at deps\v8\src\execution\microtask-queue.cc(127)
node.exe!v8::internal::MicrotaskQueue::PerformCheckpoint(isolate=0x000001c0c82c1000)
	at deps\v8\src\execution\microtask-queue.h(48)
node.exe!node::task_queue::RunMicrotasks(args)
	at src\node_task_queue.cc(143)
node.exe!Builtins_CallApiCallbackGeneric()
	at out\Release\obj\v8_snapshot\embedded.S(4265)
node.exe!Builtins_InterpreterEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3946)
node.exe!Builtins_JSEntryTrampoline()
	at out\Release\obj\v8_snapshot\embedded.S(3658)
node.exe!Builtins_JSEntry()
	at out\Release\obj\v8_snapshot\embedded.S(3616)
[Inline Frame] node.exe!v8::internal::GeneratedCode<unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,__int64,unsigned __int64 * *>::Call()
	at deps\v8\src\execution\simulator.h(178)
node.exe!v8::internal::`anonymous namespace'::Invoke(isolate=0x000001c0c82c1000, params={...})
	at deps\v8\src\execution\execution.cc(420)
node.exe!v8::internal::Execution::Call(isolate=0x000001c0c82c1000, callable, receiver, argc=0, argv=0x0000000000000000)
	at deps\v8\src\execution\execution.cc(506)
node.exe!v8::Function::Call(context, recv={...}, argc=0, argv=0x0000000000000000)
	at deps\v8\src\api\api.cc(5484)
node.exe!node::InternalCallbackScope::Close()
	at src\api\callback.cc(174)
node.exe!node::InternalCallbackScope::~InternalCallbackScope()
	at src\api\callback.cc(100)
node.exe!node::StartExecution(env=0x000001c0c8358b80, cb={...})
	at src\node.cc(443)
node.exe!node::LoadEnvironment(env=0x000001c0c8358b80, cb={...}, preload={...})
	at src\api\environment.cc(526)
[Inline Frame] node.exe!node::NodeMainInstance::Run()
	at src\node_main_instance.cc(107)
node.exe!node::NodeMainInstance::Run()
	at src\node_main_instance.cc(100)
node.exe!node::StartInternal(argc, argv)
	at src\node.cc(1536)
node.exe!node::Start(argc=2, argv=0x000001c0c66ee5f0)
	at src\node.cc(1544)
node.exe!wmain(argc, wargv=0x000001c0c6687400)
	at src\node_main.cc(91)
```
